/**
 * CampusLoop Types — Authoritative Database Interfaces
 * Strictly mirrors /supabase/schema.sql & PRD.md Section 6
 */

export interface Campus {
  id: string;
  name: string;
  city: string;
  created_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  campus_id: string;
  avatar?: string | null;
  monthly_income?: number | null;
  created_at?: string;
  campus?: Campus;
}

export type ListingType = "buy" | "sell" | "rent";
export type ListingStatus = "active" | "sold" | "archived";

export interface Listing {
  id: string;
  seller_id: string;
  campus_id: string;
  title: string;
  description: string;
  category: string;
  type: ListingType;
  price: number;
  condition: string;
  location_label: string;
  status: ListingStatus;
  created_at: string;
  seller?: User;
  images?: ListingImage[];
}

export interface ListingImage {
  id: string;
  listing_id: string;
  image_url: string;
  created_at?: string;
}

export type RoomStatus = "available" | "occupied" | "archived";

export interface BookedUser {
  user_id: string;
  user_name: string;
  user_email: string;
  user_initials: string;
  booked_at: string;
  spot_number: number;
}

export interface InterestedUser {
  user_id: string;
  user_name: string;
  user_email: string;
  user_initials: string;
  interested_at: string;
  expires_at: string; // 7 days from interested_at
}

export interface Room {
  id: string;
  owner_id: string;
  campus_id: string;
  title: string;
  rent: number;
  utilities: number;
  maintenance: number;
  bedrooms: number;
  occupancy_total: number;
  occupancy_filled: number;
  amenities: string[];
  location_label: string;
  available_from: string;
  status: RoomStatus;
  created_at?: string;
  owner?: User;
  images?: { id: string; room_id: string; image_url: string }[];
  booked_users?: BookedUser[];
  interested_users?: InterestedUser[];
}

export interface RoommateProfile {
  id: string;
  user_id: string;
  budget_min: number;
  budget_max: number;
  preferred_location: string;
  move_in_month: string;
  lifestyle_tags: string[];
  created_at?: string;
  user?: User;
}

export type ConversationType = "marketplace_dm" | "housing_group" | "roommate_dm";

export interface Conversation {
  id: string;
  listing_id?: string | null;
  room_id?: string | null;
  type: ConversationType;
  created_at: string;
  listing?: Listing | null;
  room?: Room | null;
  members?: ConversationMember[];
  last_message?: Message | null;
}

export type MemberRole = "seller" | "buyer" | "owner" | "prospective_roommate";

export interface ConversationMember {
  conversation_id: string;
  user_id: string;
  role: MemberRole;
  created_at?: string;
  user?: User;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: User;
}

export type AffordabilityFlag = "comfortable" | "moderate" | "high" | "heavy";

export interface RentSplit {
  id: string;
  room_id?: string | null;
  user_id?: string | null;
  total_rent: number;
  utilities: number;
  maintenance: number;
  occupants: number;
  per_person_share: number;
  income_used?: number | null;
  housing_ratio_pct?: number | null;
  flag_level?: AffordabilityFlag | null;
  created_at?: string;
  room?: Room | null;
}
