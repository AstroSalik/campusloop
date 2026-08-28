"use client";

import { useState, useEffect } from "react";
import { 
  UserLocationData, 
  DEFAULT_CAMPUS_LOCATION,
  getSavedLocation, 
  fetchCurrentGPSLocation, 
  saveLocation 
} from "./location";

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocationData>(DEFAULT_CAMPUS_LOCATION);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLocation(getSavedLocation());

    const handleChange = () => {
      setLocation(getSavedLocation());
    };

    window.addEventListener("campusloop_location_changed", handleChange);
    window.addEventListener("storage", handleChange);

    return () => {
      window.removeEventListener("campusloop_location_changed", handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  const detectLocation = async (): Promise<UserLocationData> => {
    setLoading(true);
    try {
      const loc = await fetchCurrentGPSLocation();
      setLocation(loc);
      setLoading(false);
      return loc;
    } catch (e) {
      setLoading(false);
      return location;
    }
  };

  const updateLocation = (label: string) => {
    const updated: UserLocationData = {
      ...location,
      label,
      source: "manual",
      updatedAt: new Date().toISOString(),
    };
    saveLocation(updated);
    setLocation(updated);
  };

  return {
    location,
    loading,
    detectLocation,
    updateLocation,
    mounted,
  };
}
