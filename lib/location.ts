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
  label: "Lovely Professional University (LPU)",
  subLabel: "Main Gate & Law Gate Area, Phagwara",
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
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let detectedLabel = "";

        // 1. Try BigDataCloud Client Reverse Geocoding (reliable, fast, no CORS/User-Agent blocks)
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);

          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
            { signal: controller.signal }
          );
          clearTimeout(timeout);

          if (res.ok) {
            const data = await res.json();
            const locality = data.locality || data.city || data.principalSubdivision;
            const region = data.principalSubdivision || data.countryName;
            if (locality) {
              detectedLabel = region && locality !== region ? `${locality}, ${region}` : locality;
            }
          }
        } catch {}

        // 2. Fallback to OpenStreetMap Nominatim if needed
        if (!detectedLabel) {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
              {
                headers: { 
                  "Accept-Language": "en",
                  "User-Agent": "CampusLoop-StudentPlatform/1.0"
                },
                signal: controller.signal,
              }
            );
            clearTimeout(timeout);

            if (res.ok) {
              const data = await res.json();
              const addr = data.address || {};
              const place = addr.suburb || addr.town || addr.city || addr.village || addr.county;
              const state = addr.state || addr.country;
              if (place) {
                detectedLabel = state ? `${place}, ${state}` : place;
              }
            }
          } catch {}
        }

        // 3. Fallback to coordinate string if geocoding APIs were unreachable
        if (!detectedLabel) {
          detectedLabel = `GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`;
        }

        const newLoc: UserLocationData = {
          latitude,
          longitude,
          label: detectedLabel,
          subLabel: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
          source: "gps",
          updatedAt: new Date().toISOString(),
        };

        saveLocation(newLoc);
        resolve(newLoc);
      },
      (error) => {
        let msg = "Could not access GPS.";
        if (error.code === 1) {
          msg = "Location permission denied. Please allow location access in your browser.";
        } else if (error.code === 2) {
          msg = "GPS position unavailable. Please check your device location settings.";
        } else if (error.code === 3) {
          msg = "GPS location request timed out. Please try again.";
        }
        reject(new Error(msg));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}
