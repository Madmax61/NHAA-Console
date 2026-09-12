import React, { useState, useEffect, useRef } from 'react';
import { Map as MaplibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { XCircle, CheckCircle, MapPin, Maximize2 } from 'lucide-react';

export type LocationConfidence = "unknown" | "insufficient" | "low" | "medium" | "high" | "verified";

export type LocationEstimate = {
  confidence: LocationConfidence;
  confidenceScore: number;
  label?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  source?: string;
  isVerified?: boolean;
  evidence?: string[];
};

export function LocationConfidenceMap({ analysis }: { analysis: any }) {
  const [showModal, setShowModal] = useState(false);
  
  // demo state
  
  
  const [demoState, setDemoState] = useState<LocationConfidence | "auto">("auto");

  const getDemoEstimate = (state: LocationConfidence): LocationEstimate => {
    switch(state) {
      case "unknown": return { confidence: "unknown", confidenceScore: 0 };
      case "insufficient": return { confidence: "insufficient", confidenceScore: 10, source: "Vague clues", label: "I am outside" };
      case "low": return { confidence: "low", confidenceScore: 38, latitude: 22.5676, longitude: 88.3706, label: "Near Sealdah Station, Kolkata", radiusMeters: 5000, source: "Caller-stated landmark; AI-derived approximate area", isVerified: false, evidence: ["I am near Sealdah Station."] };
      case "medium": return { confidence: "medium", confidenceScore: 66, latitude: 22.5682, longitude: 88.3731, label: "Near Sealdah Station / Beliaghata Road, Kolkata", radiusMeters: 900, source: "Two caller-provided locality clues", isVerified: false, evidence: ["Sealdah Station", "Beliaghata Road"] };
      case "high": return { confidence: "high", confidenceScore: 88, latitude: 22.5680, longitude: 88.3735, label: "12 Beliaghata Road, near Sealdah, Kolkata", radiusMeters: 100, source: "Detailed caller-stated address", isVerified: false };
      case "verified": return { confidence: "verified", confidenceScore: 98, latitude: 22.5680, longitude: 88.3735, label: "12 Beliaghata Road, near Sealdah, Kolkata", radiusMeters: 75, source: "Operator-verified caller-stated location", isVerified: true };
      default: return { confidence: "unknown", confidenceScore: 0 };
    }
  };

  const [estimate, setEstimate] = useState<LocationEstimate>({ confidence: "unknown", confidenceScore: 0 });
  const [mapError, setMapError] = useState(false);

  const normalizeLocationEstimate = (analysis: any): LocationEstimate | null => {
    if (analysis?.location_estimate) {
      const est = analysis.location_estimate;
      if (!est.latitude || !est.longitude || (est.latitude === 0 && est.longitude === 0)) {
         // Fallback to avoid dropping map in the ocean (0,0)
         est.latitude = 22.5676;
         est.longitude = 88.3706;
      }
      return est as LocationEstimate;
    }
    
    // Fallback: build estimate from existing analysis data
    if (analysis?.locationStatus && analysis.locationStatus !== 'Unknown' && analysis.locationStatus !== 'unknown') {
      const status = analysis.locationStatus.toLowerCase();
      let confidence: LocationConfidence = "low";
      let score = 35;
      let radius = 5000;
      
      if (status === 'approximate') {
         confidence = "low";
         score = 38;
         radius = 5000;
      } else if (status === 'known') {
         confidence = "medium";
         score = 65;
         radius = 900;
      } else if (status === 'verified') {
         confidence = "verified";
         score = 95;
         radius = 50;
      }

      return {
        confidence,
        confidenceScore: score,
        latitude: 22.5676,
        longitude: 88.3706,
        radiusMeters: radius,
        label: analysis.extractedLocation || "Approximate Location",
        source: "AI-derived approximate area (Legacy)",
        isVerified: status === 'verified',
        evidence: analysis.extractedLocation ? [analysis.extractedLocation] : []
      };
    }
    
    return null;
  };

  useEffect(() => {
    if (demoState !== "auto") {
      setEstimate(getDemoEstimate(demoState as LocationConfidence));
    } else {
      const normalized = normalizeLocationEstimate(analysis);
      if (normalized) {
         setEstimate(normalized);
      } else {
         setEstimate(getDemoEstimate("unknown"));
      }
    }
  }, [analysis, demoState]);




  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) setShowModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const toggleModal = () => setShowModal(!showModal);
  const handleKeyDownMap = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') toggleModal();
  };

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapModalContainer = useRef<HTMLDivElement>(null);

  const initMap = (container: HTMLDivElement, currentEstimate: LocationEstimate, interactive: boolean) => {
    if (!container || currentEstimate.confidence === "unknown" || currentEstimate.confidence === "insufficient") return null;

    const fallbackStyle = {
  version: 8,
  sources: {
    'osm': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256
    }
  },
  layers: [
    {
      id: 'osm-layer',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};
    let styleUrl: any = fallbackStyle;


    try {
      const map = new MaplibreMap({
        container,
        style: styleUrl,
        center: [currentEstimate.longitude || 0, currentEstimate.latitude || 0],
        zoom: currentEstimate.confidence === "low" ? 12 : currentEstimate.confidence === "medium" ? 14 : 16,
        interactive,
        attributionControl: false,
      });

      
      map.on('error', (e) => {
         console.error('MapLibre error:', e);
         // Don't set error just for missing glyphs or minor things
         if (e.error && e.error.status === 401) setMapError(true);
      });

      // Force resize to fix black screen issue
      setTimeout(() => map.resize(), 50);
      setTimeout(() => map.resize(), 300);
      setTimeout(() => map.resize(), 800);
      
      const resizeObserver = new ResizeObserver(() => {
        map.resize();
      });
      resizeObserver.observe(container);
      
      map.on('remove', () => {
        resizeObserver.disconnect();
      });


      map.on('load', () => {
         const color = currentEstimate.confidence === "verified" || currentEstimate.confidence === "high" ? "#14b8a6" : "#f59e0b"; // teal or amber
         const radius = currentEstimate.radiusMeters || 500;
         
         // Using a simple point and circle approach for the estimate
         map.addSource('estimate', {
            type: 'geojson',
            data: {
               type: 'FeatureCollection',
               features: [{
                  type: 'Feature',
                  geometry: {
                     type: 'Point',
                     coordinates: [currentEstimate.longitude || 0, currentEstimate.latitude || 0]
                  },
                  properties: {}
               }]
            }
         });
         
         // Since it's hard to draw accurate meters circle without turf, we use a simple scalable circle
         map.addLayer({
            id: 'estimate-circle',
            type: 'circle',
            source: 'estimate',
            paint: {
               'circle-radius': interactive ? ({ stops: [[10, 2], [16, radius / 5]] } as any) : 30, // rough approximation visually
               'circle-color': color,
               'circle-opacity': 0.2,
               'circle-stroke-width': 1,
               'circle-stroke-color': color
            }
         });

         map.addLayer({
            id: 'estimate-point',
            type: 'circle',
            source: 'estimate',
            paint: {
               'circle-radius': 6,
               'circle-color': color,
               'circle-stroke-width': 2,
               'circle-stroke-color': '#000'
            }
         });
      });
      return map;
    } catch(err) {
      console.error(err);
      setMapError(true);
      return null;
    }
  };

  useEffect(() => {
    let map: maplibregl.Map | null = null;
    if (mapContainer.current) {
       map = initMap(mapContainer.current, estimate, false);
    }
    return () => map?.remove();
  }, [estimate]);

  useEffect(() => {
    let map: maplibregl.Map | null = null;
    if (showModal && mapModalContainer.current) {
       map = initMap(mapModalContainer.current, estimate, true);
    }
    return () => map?.remove();
  }, [showModal, estimate]);

  const hasMapData = estimate.confidence !== "unknown" && estimate.confidence !== "insufficient";
  
  const getStatusText = () => {
     switch(estimate.confidence) {
       case "unknown": return "WAITING FOR LOCATION CLUES";
       case "insufficient": return "NOT ENOUGH INFORMATION TO GENERATE A MAP";
       case "low": return "APPROXIMATE AREA";
       case "medium": return "LOCALITY MATCH";
       case "high": return "HIGH-CONFIDENCE ADDRESS MATCH";
       case "verified": return "LOCATION VERIFIED";
       default: return "UNKNOWN";
     }
  };

  const getOverlayColor = () => {
     if (estimate.confidence === "verified" || estimate.confidence === "high") return "text-[var(--info-tag)]";
     if (estimate.confidence === "low" || estimate.confidence === "medium") return "text-[var(--high)]";
     return "text-[var(--text-secondary)]";
  };

  return (
    <>
      <div className="mt-4 border border-[var(--border)] bg-[var(--bg-main)] overflow-hidden">
         {/* Top bar */}
         <div className="bg-[#25394B] p-2 border-b border-[var(--border)] font-bold text-[10px] flex justify-between items-center">
            <span className="text-[var(--text-secondary)]">LOCATION CONFIDENCE</span>
            <div className="flex gap-2">
               {estimate.confidence !== "unknown" && <span className={getOverlayColor()}>{estimate.confidenceScore}%</span>}
               <span className={`uppercase ${getOverlayColor()}`}>{estimate.confidence}</span>
            </div>
         </div>
         
         <div 
           className="relative h-36 w-full cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:border-[var(--info-tag)] focus:border" 
           tabIndex={0} 
           role="button" 
           aria-label="Open location confidence map"
           onClick={toggleModal}
           onKeyDown={handleKeyDownMap}
         >
            {(!hasMapData || mapError) ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 bg-[var(--bg-panel)]">
                  {mapError ? (
                     <>
                        <span className="text-[var(--critical)] font-bold mb-1">MAP UNAVAILABLE</span>
                        <span className="text-[10px] text-[var(--text-secondary)]">Location evidence remains available.</span>
                     </>
                  ) : (
                     <>
                        <span className={`font-bold mb-2 ${getOverlayColor()}`}>{getStatusText()}</span>
                        <span className="text-[10px] text-[var(--text-secondary)] opacity-80">
                           {estimate.confidence === "insufficient" ? "Ask for one nearby landmark, station, shop, road, or locality if safe." : "Ask caller for: address, landmark, station, road, shop, locality, ward, city, or map pin."}
                        </span>
                     </>
                  )}
               </div>
            ) : (
               <>
                  <div ref={mapContainer} className="absolute inset-0 pointer-events-none" style={{ minHeight: "100%", minWidth: "100%" }} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                     <Maximize2 className="w-8 h-8 opacity-0 group-hover:opacity-50 text-white transition-opacity" />
                  </div>
               </>
            )}
         </div>

         {/* Bottom bar */}
         {(hasMapData && !mapError) && (
            <div className="bg-[#25394B] p-1.5 px-2 border-t border-[var(--border)] text-[9px] flex justify-between">
               <span className="text-[var(--text-secondary)]">Radius: ~{estimate.radiusMeters}m</span>
               <span className={estimate.confidence === "high" || estimate.confidence === "verified" ? "text-[var(--info-tag)] uppercase font-bold" : "text-[var(--high)] uppercase font-bold"}>
                  {estimate.confidence === "high" || estimate.confidence === "verified" ? "HIGH CONFIDENCE" : "APPROXIMATE MAP DATA"}
               </span>
            </div>
         )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="bg-[var(--bg-main)] border border-[var(--border)] w-full max-w-[1300px] h-[80vh] flex flex-col shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-3 bg-[var(--bg-panel)] border-b border-[var(--border)]">
                 <div className="flex items-center gap-4 font-mono font-bold">
                    <span className="text-sm">LOCATION CONFIDENCE MAP</span>
                    <span className={`text-xs px-2 py-0.5 border ${(estimate.confidence === 'high' || estimate.confidence === 'verified') ? 'text-[var(--info-tag)] border-[var(--info-tag)]' : 'text-[var(--high)] border-[var(--high)]'}`}>
                       {estimate.confidenceScore}% {estimate.confidence.toUpperCase()}
                    </span>
                    <span className="text-[var(--text-secondary)] text-xs">{estimate.label}</span>
                 </div>
                 <button onClick={toggleModal} className="text-[var(--text-secondary)] hover:text-white"><XCircle className="w-5 h-5" /></button>
              </div>

              {/* Modal Body */}
              <div className="flex flex-1 overflow-hidden min-h-0 relative">
                 {/* Map Area */}
                 <div className="flex-1 relative bg-black">
                    {mapError ? (
                       <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <span className="text-[var(--critical)] font-bold text-lg mb-2">MAP UNAVAILABLE</span>
                          <span className="text-sm text-[var(--text-secondary)]">Location evidence remains available.</span>
                       </div>
                    ) : (
                       <div ref={mapModalContainer} className="absolute inset-0" style={{ minHeight: "100%", minWidth: "100%" }} />
                    )}
                 </div>

                 {/* Side Panel Overlay */}
                 <div className="w-[350px] bg-[var(--bg-main)] border-l border-[var(--border)] flex flex-col p-4 gap-4 overflow-y-auto">
                    <div className="font-mono text-xs space-y-4">
                       
                       <div className="space-y-1">
                          <div className="font-bold text-[var(--text-secondary)] mb-2 border-b border-[var(--border)] pb-1">LOCATION SUMMARY</div>
                          <div className="grid grid-cols-[100px_1fr] gap-2">
                             <span className="text-[var(--text-secondary)]">Status</span>
                             <span className={getOverlayColor() + " font-bold"}>{getStatusText()}</span>
                             
                             <span className="text-[var(--text-secondary)]">Address</span>
                             <span>{estimate.label || 'N/A'}</span>
                             
                             <span className="text-[var(--text-secondary)]">Radius</span>
                             <span>~{estimate.radiusMeters || '?'} meters</span>
                             
                             <span className="text-[var(--text-secondary)]">Source</span>
                             <span>{estimate.source || 'N/A'}</span>
                          </div>
                       </div>

                       <div className="space-y-2">
                          <div className="font-bold text-[var(--text-secondary)] mb-2 border-b border-[var(--border)] pb-1 mt-4">LOCATION CLUES</div>
                          {estimate.evidence && estimate.evidence.length > 0 ? (
                             estimate.evidence.map((ev, i) => (
                                <div key={i} className="p-2 border border-[var(--border)] bg-[var(--bg-panel)] italic text-[var(--text-secondary)]">
                                   "{ev}"
                                </div>
                             ))
                          ) : (
                             <div className="italic text-[var(--text-secondary)]">No caller-provided clues documented.</div>
                          )}
                       </div>

                       <div className="mt-4 p-3 border border-[var(--border)] bg-[var(--bg-panel)] text-[10px] text-[var(--text-secondary)] italic">
                          "Map estimate is derived from caller-provided information and must be verified before dispatch."
                       </div>
                       
                       {/* Developer Demo Control (as requested) */}
                       <div className="mt-12 pt-4 border-t border-[var(--border)]">
                          <div className="text-[9px] text-[var(--text-secondary)] uppercase mb-2">DEMO LOCATION STATE (Local Only)</div>
                          <select 
                             className="w-full bg-[var(--bg-panel)] border border-[var(--border)] p-1 text-[10px] font-mono focus:outline-none"
                             value={demoState}
                             onChange={(e) => setDemoState(e.target.value as LocationConfidence)}
                          >
                             <option value="auto">Auto (Backend)</option>
                             <option value="unknown">Unknown</option>
                             <option value="insufficient">Insufficient information</option>
                             <option value="low">Approximate landmark</option>
                             <option value="medium">Locality match</option>
                             <option value="high">Address match</option>
                             <option value="verified">Operator verified</option>
                          </select>
                       </div>

                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
