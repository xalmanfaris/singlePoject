import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, ArrowLeft, Compass, Navigation } from 'lucide-react';
import { GoogleMap, Marker, Polyline, DirectionsRenderer, OverlayView } from '@react-google-maps/api';

/**
 * 🔧 ARCHITECTURAL REFACTOR: Optimized Trip Map Component
 * Specializes in high-performance route rendering and sequential itinerary management.
 */
const TripMap = React.memo(({ aiTripPlan, transportMode, theme, isLoaded, currentLocationIndex }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [directions, setDirections] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  
  // 📍 1. Extract and Validate Sequential Points
  const tripPoints = useMemo(() => {
    if (!aiTripPlan) return [];
    const points = [];
    
    // Origin handling: Start place from topPlaces[0]
    const startPlace = aiTripPlan.topPlaces?.[0];
    const startLat = parseFloat(startPlace?.coordinates?.lat);
    const startLng = parseFloat(startPlace?.coordinates?.lng);
    
    if (!isNaN(startLat) && !isNaN(startLng) && startLat !== 0) {
      points.push({ 
        lat: startLat, 
        lng: startLng, 
        name: startPlace.name || "Starting Point",
        isOrigin: true 
      });
    }

    // Waypoints & Destination handling: Itinerary activities
    aiTripPlan.itinerary?.forEach(day => {
      day.activities?.forEach(act => {
        const lat = parseFloat(act.coordinates?.lat);
        const lng = parseFloat(act.coordinates?.lng);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0) {
          const prev = points[points.length - 1];
          // Simple deduplication
          if (!prev || Math.abs(prev.lat - lat) > 0.0001 || Math.abs(prev.lng - lng) > 0.0001) {
            points.push({ lat, lng, name: act.activity });
          }
        }
      });
    });

    return points;
  }, [aiTripPlan]);

  // 🛣 2. Robust Routing Logic (memoized)
  const calculateRoute = useCallback(() => {
    if (!isLoaded || tripPoints.length < 2 || transportMode === 'flight' || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    // Enforcement: Road modes use DRIVING for reliable road-following
    const travelMode = (transportMode === 'car' || transportMode === 'bus' || transportMode === 'rv') 
      ? window.google.maps.TravelMode.DRIVING 
      : (transportMode === 'walk' ? window.google.maps.TravelMode.WALKING : window.google.maps.TravelMode.DRIVING);

    const origin = { lat: tripPoints[0].lat, lng: tripPoints[0].lng };
    const destination = { lat: tripPoints[tripPoints.length - 1].lat, lng: tripPoints[tripPoints.length - 1].lng };
    const waypoints = tripPoints.slice(1, -1).map(p => ({
      location: { lat: p.lat, lng: p.lng },
      stopover: true
    }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        optimizeWaypoints: false, // STRICTURE: Preserve itinerary order
        travelMode
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
        } else {
          console.error(`[MapArch] Routing failed: ${status}.`);
          setDirections(null);
        }
      }
    );
  }, [isLoaded, tripPoints, transportMode]);

  // Debounce routing on load or point change
  useEffect(() => {
    const timer = setTimeout(calculateRoute, 500);
    return () => clearTimeout(timer);
  }, [calculateRoute]);

  // ⚡ 3. Map Event Handlers
  const onMapLoad = useCallback((map) => {
    setMapInstance(map);
    if (tripPoints.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      tripPoints.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
      setTimeout(() => map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 }), 100);
    }
  }, [tripPoints]);

  // 📊 4. Route Summary Panel
  const routeSummary = useMemo(() => {
    if (!directions) return null;
    const route = directions.routes[0];
    let dist = 0;
    let dur = 0;
    route.legs.forEach(leg => {
      dist += leg.distance.value;
      dur += leg.duration.value;
    });
    return {
      distance: (dist / 1000).toFixed(1) + ' km',
      duration: Math.round(dur / 60) + ' min',
      stops: tripPoints.length
    };
  }, [directions, tripPoints]);

  const MapContent = (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      onLoad={onMapLoad}
      options={{
        disableDefaultUI: !isFullscreen,
        zoomControl: isFullscreen,
        styles: theme === 'dark' ? [
          { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] }
        ] : []
      }}
    >
      {/* 📍 Custom Numbered Markers */}
      {tripPoints.map((point, idx) => {
        // Decide if this point should have the boomerang pulse
        // If trip hasn't started (index 0 and not explicitly set), pulse the origin (idx 0)
        // Otherwise, pulse the current location (idx currentLocationIndex + 1)
        const isPulseTarget = (currentLocationIndex === undefined || currentLocationIndex === null || currentLocationIndex === 0) 
          ? idx === 0 
          : idx === currentLocationIndex + 1;

        if (isPulseTarget) {
          // Boomerang Pulse Dot
          return (
            <OverlayView
              key={`${isFullscreen ? 'fs-' : 'std-'}${idx}`}
              position={{ lat: point.lat, lng: point.lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
                <div className="absolute w-12 h-12 bg-indigo-500/50 rounded-full animate-ping"></div>
                <div className={`relative w-6 h-6 ${idx === 0 ? 'bg-indigo-600' : 'bg-emerald-600'} border-[2.5px] border-white rounded-full shadow-xl z-10 flex items-center justify-center`}>
                  <span className="text-white text-[11px] font-black tracking-tighter">{idx + 1}</span>
                </div>
                <div className="absolute top-full mt-2 px-3 py-1.5 bg-black/90 backdrop-blur-md text-white text-[11px] font-bold rounded-xl shadow-2xl whitespace-nowrap border border-white/10">
                  📍 {idx === currentLocationIndex + 1 ? "We are here: " : ""}{point.name}
                </div>
              </div>
            </OverlayView>
          );
        }

        return (
          <Marker
            key={`${isFullscreen ? 'fs-' : 'std-'}${idx}`}
            position={{ lat: point.lat, lng: point.lng }}
            label={{
              text: (idx + 1).toString(),
              color: 'white',
              fontWeight: '900',
              fontSize: '13px'
            }}
            title={point.name}
            icon={idx === tripPoints.length - 1 ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png" : undefined}
          />
        );
      })}

      {/* 🛣 Directions or Flight Polyline */}
      {directions ? (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#6366f1',
              strokeWeight: 6,
              strokeOpacity: 0.9
            }
          }}
        />
      ) : (
        tripPoints.length > 1 && (
          <Polyline
            path={tripPoints.map(p => ({ lat: p.lat, lng: p.lng }))}
            options={{
              strokeColor: '#6366f1',
              strokeWeight: 4,
              strokeOpacity: 0.6,
              geodesic: true
            }}
          />
        )
      )}
    </GoogleMap>
  );

  return (
    <div className={`relative h-full w-full rounded-[2.5rem] overflow-hidden border shadow-2xl transition-all duration-500`}>
      {MapContent}
      
      {/* 🧭 6. Floating Control Panel */}
      <div className="absolute top-3 lg:top-6 left-3 lg:left-6 right-3 lg:right-6 flex items-start justify-between pointer-events-none z-10">
        <div className="flex flex-col gap-3 pointer-events-auto">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl border flex items-center justify-center shadow-xl transition-all ${
              theme === 'dark'
                ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/40'
                : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700'
            }`}
            title="Toggle Map Size"
          >
            <MapIcon size={18} className="lg:hidden" />
            <MapIcon size={20} className="hidden lg:block" />
          </motion.button>
        </div>

        <div className="flex flex-col gap-4 items-end">
          {/* 📄 Trip Meta Overlay */}
          <div className="p-4 lg:p-6 glass rounded-2xl lg:rounded-3xl border border-white/10 shadow-2xl pointer-events-auto backdrop-blur-2xl max-w-[220px] lg:max-w-sm">
            <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
              <div className="p-1.5 lg:p-2 rounded-lg lg:rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30 shrink-0">
                <Compass size={14} className="text-white lg:hidden" />
                <Compass size={18} className="text-white hidden lg:block" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm lg:text-xl font-black tracking-tighter text-white truncate">{aiTripPlan.destination}</h2>
                <p className="text-[8px] lg:text-[10px] font-bold opacity-50 uppercase tracking-widest truncate">Route Exploration</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-[9px] lg:text-xs font-medium opacity-40">
              <span className="px-1.5 py-0.5 rounded-full bg-white/10">{aiTripPlan.transportMode || 'Driving'}</span>
              <span>•</span>
              <span>{tripPoints.length} Stops</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[200] bg-[#0f111a] flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsFullscreen(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors">
                  <ArrowLeft size={24} />
                </button>
                <h3 className="font-black text-2xl tracking-tighter">Full Trip Visualization</h3>
              </div>
              <button onClick={() => setIsFullscreen(false)} className="bg-white text-black px-8 py-3 rounded-2xl font-black shadow-lg">
                Close Explorer
              </button>
            </div>
            <div className="flex-1 relative">
              {MapContent}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl min-w-[300px]">
                <h4 className="font-black text-lg mb-4 text-center">Route Statistics</h4>
                <div className="grid grid-cols-3 gap-8">
                  <div className="text-center">
                    <p className="text-xs opacity-50 font-bold mb-1">STOPS</p>
                    <p className="text-xl font-black text-indigo-400">{tripPoints.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs opacity-50 font-bold mb-1">TOTAL DIST</p>
                    <p className="text-xl font-black text-indigo-400">{routeSummary?.distance || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs opacity-50 font-bold mb-1">TOTAL TIME</p>
                    <p className="text-xl font-black text-indigo-400">{routeSummary?.duration || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default TripMap;
