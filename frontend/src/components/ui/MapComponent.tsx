"use client";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const VerifiedIcon = L.divIcon({
  html: `<div class="w-8 h-8 bg-brand-red rounded-full border-4 border-white shadow-premium flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const ExternalIcon = L.divIcon({
  html: `<div class="w-6 h-6 bg-brand-charcoal rounded-full border-2 border-white shadow-premium flex items-center justify-center text-white/50"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const CollegeIcon = L.divIcon({
  html: `<div class="w-10 h-10 bg-white rounded-2xl border-2 border-brand-red shadow-hover flex items-center justify-center text-brand-red animate-pulse"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg></div>`,
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  properties: any[];
  center: [number, number];
  college?: any;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapComponent({ properties, center, college }: MapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full h-full bg-stone-100 rounded-[40px] animate-pulse" />;

  return (
    <MapContainer 
      center={center} 
      zoom={14} 
      className="w-full h-full"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      
      <ChangeView center={center} />

      {college && (
        <Marker 
          position={[parseFloat(college.latitude), parseFloat(college.longitude)]} 
          icon={CollegeIcon}
        >
          <Popup>
            <div className="p-2">
              <p className="font-heading font-black text-brand-charcoal text-sm">{college.name}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-red">Your Campus Hub</p>
            </div>
          </Popup>
        </Marker>
      )}

      {properties.map((prop) => (
        <Marker 
          key={prop.property_id} 
          position={[parseFloat(prop.latitude), parseFloat(prop.longitude)]}
          icon={prop.is_verified ? VerifiedIcon : ExternalIcon}
        >
          <Popup className="premium-popup">
            <div className="w-48 overflow-hidden">
                {prop.image && (
                    <img src={prop.image} className="w-full h-24 object-cover rounded-t-xl mb-3" alt={prop.title} />
                )}
                <div className="p-1">
                    <p className="font-heading font-black text-brand-charcoal text-sm leading-tight mb-1">{prop.title}</p>
                    <p className="text-brand-red font-black text-xs italic">₹{prop.price.toLocaleString()}/mo</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${prop.is_verified ? 'bg-brand-red text-white' : 'bg-stone-100 text-stone-400'}`}>
                            {prop.is_verified ? 'Verified' : 'Unverified'}
                        </span>
                    </div>
                </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
