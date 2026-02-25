import { useCallback, useEffect, useMemo, useState } from "react";
import type { LngLatBoundsLike } from "mapbox-gl";

interface DebugPanelProps {
  map: mapboxgl.Map | null;
  layerId: string;
}

interface DebugState {
  zoom: number;
  center: [number, number];
  bounds: LngLatBoundsLike | null;
}

export function DebugPanel({ map, layerId }: DebugPanelProps) {
  const [layerVisible, setLayerVisible] = useState(true);
  const [, setDebugState] = useState<DebugState>({
    zoom: 0,
    center: [0, 0],
    bounds: null,
  });

  // useCallback prevents function recreation on every render
  const toggleLayer = useCallback(() => {
    if (!map || !map.getLayer(layerId)) return;

    const next = !layerVisible;
    map.setLayoutProperty(layerId, "visibility", next ? "visible" : "none");
    setLayerVisible(next);
  }, [map, layerId, layerVisible]);

  useEffect(() => {
    if (!map) return;

    const updateDebugState = () => {
      setDebugState({
        zoom: Number(map.getZoom().toFixed(2)),
        center: [Number(map.getCenter().lng.toFixed(5)), Number(map.getCenter().lat.toFixed(5))],
        bounds: map.getBounds()?.toArray() ?? null,
      });
    };

    map.on("load", updateDebugState);
    map.on("moveend", updateDebugState);

    return () => {
      map.off("load", updateDebugState);
      map.off("moveend", updateDebugState);
    };
  }, [map]);

  // Prevents new object references on every render
  const containerStyle = useMemo(
    () => ({
      position: "absolute" as const,
      top: 12,
      left: 12,
      background: "white",
      padding: "12px 14px",
      borderRadius: 6,
      fontFamily: "monospace",
      fontSize: 12,
      lineHeight: 1.4,
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      maxWidth: 360,
    }),
    [],
  );

  return (
    <div style={containerStyle}>
      <h3>Atlas de Verniquet (1775-1789)</h3>
      <button onClick={toggleLayer} className={layerVisible ? "active" : ""}>
        {" "}
        {layerVisible ? "Hide layer" : "Show layer"}
      </button>{" "}
      {/* <div style={{ marginTop: 8 }}>
        <b>Zoom</b>: {debugState.zoom}
      </div>
      <div>
        <b>Center</b>: {debugState.center[0]}, {debugState.center[1]}
      </div> */}
      {/* <div>
        <b>Bounds</b>:
        <pre style={{ margin: "4px 0 0" }}>{JSON.stringify(debugState.bounds, null, 2)}</pre>
      </div> */}
      <p>
        Follow the project :<br />
        <a
          href="https://bsky.app/profile/turgot3d.bsky.social"
          target="_blank"
          rel="noopener noreferrer"
        >
          turgot3d.bsky.social
        </a>
      </p>
    </div>
  );
}
