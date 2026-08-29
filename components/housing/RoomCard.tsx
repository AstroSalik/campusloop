"use client";

import Link from "next/link";
import { 
  Bed, 
  Building2, 
  ChevronRight, 
  Home, 
  MapPin, 
  Percent, 
  ShieldCheck, 
  Sparkles, 
  Users 
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Room } from "@/lib/types";

interface RoomCardProps {
  room: Room & { owner_name?: string; owner_initials?: string; owner_email?: string };
}

export function RoomCard({ room }: RoomCardProps) {
  const spotsLeft = room.occupancy_total - room.occupancy_filled;
  const isFull = spotsLeft <= 0;

  return (
    <Link href={`/housing/${room.id}`} className="group block">
      <Card className="h-full overflow-hidden border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/40 dark:hover:border-primary/50 flex flex-col justify-between">
        <div>
          {/* Header Graphic / Image Area */}
          <div className="relative h-44 w-full bg-gradient-to-br from-primary/5 dark:from-primary/15 to-slate-100 dark:to-slate-800 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 overflow-hidden group-hover:from-primary/10 transition-colors">
            {room.images && room.images.length > 0 ? (
              <img
                src={room.images[0].image_url}
                alt={room.title}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex flex-col items-center space-y-1 text-center p-4">
                <Building2 className="h-10 w-10 text-primary/60 dark:text-primary/80 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {room.bedrooms} BHK Accommodation
                </span>
              </div>
            )}

            {/* Occupancy Status Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <Badge
                variant="outline"
                className={`text-[10px] font-bold px-2 py-0.5 shadow-2xs ${
                  isFull
                    ? "bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                    : spotsLeft === 1
                    ? "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    : "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                }`}
              >
                <Users className="h-3 w-3 mr-1 inline-block" />
                {isFull ? "Filled" : `${spotsLeft} of ${room.occupancy_total} Left`}
              </Badge>

              {room.interested_users && room.interested_users.length > 0 && !isFull && (
                <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 shadow-2xs">
                  🔥 {room.interested_users.length} Looking
                </span>
              )}
            </div>

            {/* Move in date */}
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-medium bg-white/90 dark:bg-slate-800/90 backdrop-blur px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs">
                From {room.available_from}
              </span>
            </div>
          </div>

          <CardHeader className="p-4 pb-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{room.location_label}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
              {room.title}
            </h3>
          </CardHeader>

          <CardContent className="p-4 pt-1 space-y-3">
            {/* Amenities Tags */}
            <div className="flex flex-wrap gap-1">
              {room.amenities.slice(0, 3).map((amenity, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                >
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 3 && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 text-slate-400">
                  +{room.amenities.length - 3} more
                </span>
              )}
            </div>
          </CardContent>
        </div>

        <CardFooter className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/40">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Total Rent</span>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-none">
              ₹{room.rent.toLocaleString("en-IN")}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/mo</span>
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
            <span>View</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
