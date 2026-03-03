"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Color } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import ThreeGlobe from "three-globe";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import countries from "@/data/globe.json";

declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<ThreeGlobe> },
      HTMLElement
    >;
  }
}

const RING_PROPAGATION_SPEED = 3;
const cameraZ = 300;

type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
};

export type GlobeConfig = {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: { lat: number; lng: number };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
};

interface WorldProps {
  globeConfig: GlobeConfig;
  data: Position[];
}

function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

function GlobeInner({ globeConfig, data }: WorldProps) {
  const globeRef = useRef<ThreeGlobe | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const defaultProps = {
    pointSize: 1,
    atmosphereColor: "#ffffff",
    showAtmosphere: true,
    atmosphereAltitude: 0.1,
    polygonColor: "rgba(255,255,255,0.7)",
    globeColor: "#062056",
    emissive: "#062056",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    arcTime: 2000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    ...globeConfig
  };

  useEffect(() => {
    if (!globeRef.current && groupRef.current) {
      globeRef.current = new ThreeGlobe();
      groupRef.current.add(globeRef.current as unknown as THREE.Object3D);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!globeRef.current || !isInitialized) return;
    const material = globeRef.current.globeMaterial() as unknown as {
      color: Color;
      emissive: Color;
      emissiveIntensity: number;
      shininess: number;
    };
    material.color = new Color(defaultProps.globeColor);
    material.emissive = new Color(defaultProps.emissive);
    material.emissiveIntensity = defaultProps.emissiveIntensity ?? 0.1;
    material.shininess = defaultProps.shininess ?? 0.9;
  }, [isInitialized, defaultProps.globeColor, defaultProps.emissive, defaultProps.emissiveIntensity, defaultProps.shininess]);

  useEffect(() => {
    if (!globeRef.current || !isInitialized || !data?.length) return;

    const features = (countries as { features?: GeoJSON.Feature[] }).features ?? [];
    const points: Array<{ size: number; order: number; color: string; lat: number; lng: number }> = [];
    data.forEach((arc) => {
      points.push({ size: defaultProps.pointSize, order: arc.order, color: arc.color, lat: arc.startLat, lng: arc.startLng });
      points.push({ size: defaultProps.pointSize, order: arc.order, color: arc.color, lat: arc.endLat, lng: arc.endLng });
    });
    const filteredPoints = points.filter(
      (v, i, a) => a.findIndex((v2) => v2.lat === v.lat && v2.lng === v.lng) === i
    );

    globeRef.current.hexPolygonsData(features).hexPolygonResolution(3).hexPolygonMargin(0.7);
    globeRef.current.showAtmosphere(defaultProps.showAtmosphere);
    globeRef.current.atmosphereColor(defaultProps.atmosphereColor);
    globeRef.current.atmosphereAltitude(defaultProps.atmosphereAltitude);
    globeRef.current.hexPolygonColor(() => defaultProps.polygonColor);

    globeRef.current
      .arcsData(data)
      .arcStartLat((d) => (d as Position).startLat)
      .arcStartLng((d) => (d as Position).startLng)
      .arcEndLat((d) => (d as Position).endLat)
      .arcEndLng((d) => (d as Position).endLng)
      .arcColor((e: unknown) => (e as Position).color)
      .arcAltitude((e: unknown) => (e as Position).arcAlt)
      .arcStroke(() => 0.3)
      .arcDashLength(defaultProps.arcLength)
      .arcDashInitialGap((e) => (e as Position).order)
      .arcDashGap(15)
      .arcDashAnimateTime(() => defaultProps.arcTime);

    globeRef.current
      .pointsData(filteredPoints)
      .pointColor((e) => (e as { color: string }).color)
      .pointsMerge(true)
      .pointAltitude(0)
      .pointRadius(2);

    globeRef.current.ringsData([]).ringColor(() => defaultProps.polygonColor).ringMaxRadius(defaultProps.maxRings).ringPropagationSpeed(RING_PROPAGATION_SPEED).ringRepeatPeriod((defaultProps.arcTime * defaultProps.arcLength) / defaultProps.rings);
  }, [isInitialized, data, defaultProps.pointSize, defaultProps.showAtmosphere, defaultProps.atmosphereColor, defaultProps.atmosphereAltitude, defaultProps.polygonColor, defaultProps.arcLength, defaultProps.arcTime, defaultProps.rings, defaultProps.maxRings]);

  useEffect(() => {
    if (!globeRef.current || !isInitialized || !data?.length) return;
    const interval = setInterval(() => {
      if (!globeRef.current) return;
      const indices = Array.from({ length: data.length }, (_, i) => i).sort(() => Math.random() - 0.5).slice(0, Math.floor(data.length * 0.8));
      const ringsData = data.filter((_, i) => indices.includes(i)).map((d) => ({ lat: d.startLat, lng: d.startLng, color: d.color }));
      globeRef.current!.ringsData(ringsData);
    }, 2000);
    return () => clearInterval(interval);
  }, [isInitialized, data]);

  return <group ref={groupRef} />;
}

function OrbitControlsAutoRotate(props: {
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}) {
  const { autoRotate = true, autoRotateSpeed = 0.5 } = props;
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls | null>(null);
  useEffect(() => {
    controlsRef.current = new OrbitControls(camera, gl.domElement);
    controlsRef.current.enableZoom = false;
    controlsRef.current.enablePan = false;
    controlsRef.current.autoRotate = autoRotate;
    controlsRef.current.autoRotateSpeed = autoRotateSpeed;
    return () => controlsRef.current?.dispose();
  }, [camera, gl.domElement, autoRotate, autoRotateSpeed]);
  useFrame(() => controlsRef.current?.update());
  return null;
}

export function World({ globeConfig, data }: WorldProps) {
  return (
    <Canvas camera={{ position: [0, 0, cameraZ], fov: 45 }}>
      <ambientLight color={globeConfig.ambientLight ?? "#38bdf8"} intensity={1} />
      <directionalLight position={[1, 0, 1]} color={globeConfig.directionalLeftLight ?? "#ffffff"} />
      <directionalLight position={[0, 1, 1]} color={globeConfig.directionalTopLight ?? "#ffffff"} />
      <pointLight position={[0, 0, 200]} color={globeConfig.pointLight ?? "#ffffff"} intensity={1} />
      <GlobeInner globeConfig={globeConfig} data={data} />
      <OrbitControlsAutoRotate autoRotate={globeConfig.autoRotate ?? true} autoRotateSpeed={globeConfig.autoRotateSpeed ?? 0.5} />
    </Canvas>
  );
}
