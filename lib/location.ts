"use client";

export interface UserLocationData {
  latitude?: number;
  longitude?: number;
  label: string;
  subLabel?: string;
  source: "gps" | "preset" | "manual";
  updatedAt: string;
}

const LOCATION_STORAGE_KEY = "campusloop_current_location";

export const DEFAULT_CAMPUS_LOCATION: UserLocationData = {
  label: "Demo Campus (Sopore)",
  subLabel: "Hostel 3 & Main Gate Area",
  source: "preset",
  updatedAt: new Date().toISOString(),
};

export function getSavedLocation(): UserLocationData {
  if (typeof window === "undefined") return DEFAULT_CAMPUS_LOCATION;
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return DEFAULT_CAMPUS_LOCATION;
}

export function saveLocation(loc: UserLocationData) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
      window.dispatchEvent(new Event("campusloop_location_changed"));
    } catch (e) {}
  }
}

export async function fetchCurrentGPSLocation(): Promise<UserLocationData> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      const fallback: UserLocationData = {
        ...DEFAULT_CAMPUS_LOCATION,
        label: "Hostel 3 (Campus Area)",
        source: "manual",
        updatedAt: new Date().toISOString(),
      };
      saveLocation(fallback);
      resolve(fallback);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode with OpenStreetMap Nominatim
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 4000);

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: { "Accept-Language": "en" },
              signal: controller.signal,
            }
          );
          clearTimeout(timeout);

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const neighborhood =
              addr.neighbourhood ||
              addr.suburb ||
              addr.road ||
              addr.residential ||
              addr.college ||
              addr.university;
            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.state_district ||
              "Sopore";

            const detectedLabel = neighborhood
              ? `${neighborhood}, ${city}`
              : `${city} (GPS Detected)`;

            const newLoc: UserLocationData = {
              latitude,
              longitude,
              label: detectedLabel,
              subLabel: `Lat: ${latitude.toFixed(3)}, Lon: ${longitude.toFixed(3)}`,
              source: "gps",
              updatedAt: new Date().toISOString(),
            };

            saveLocation(newLoc);
            resolve(newLoc);
            return;
          }
        } catch (e) {
          // Reverse geocoding failed or timed out, use coordinate label
        }

        const coordLoc: UserLocationData = {
          latitude,
          longitude,
          label: `GPS Location (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
          subLabel: "Near Demo Campus",
          source: "gps",
          updatedAt: new Date().toISOString(),
        };
        saveLocation(coordLoc);
        resolve(coordLoc);
      },
      (error) => {
        // Fallback to campus spot
        const fallback: UserLocationData = {
          ...DEFAULT_CAMPUS_LOCATION,
          label: "Hostel 3 / Main Gate (Campus)",
          subLabel: "GPS permission not granted, using Campus spot",
          source: "manual",
          updatedAt: new Date().toISOString(),
        };
        saveLocation(fallback);
        resolve(fallback);
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  });
}
