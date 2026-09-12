/**
 * Authoritative Campuses & Universities Directory for CampusLoop
 * Provides curated major institutions and flexible support for any college/university.
 */

export interface CampusOption {
  id: string;
  name: string;
  city: string;
  state: string;
}

export const MAJOR_CAMPUSES: CampusOption[] = [
  {
    id: "lpu-phagwara",
    name: "Lovely Professional University (LPU)",
    city: "Phagwara",
    state: "Punjab",
  },
  {
    id: "du-delhi",
    name: "Delhi University (DU)",
    city: "New Delhi",
    state: "Delhi",
  },
  {
    id: "iit-delhi",
    name: "Indian Institute of Technology (IIT Delhi)",
    city: "New Delhi",
    state: "Delhi",
  },
  {
    id: "cu-chandigarh",
    name: "Chandigarh University (CU)",
    city: "Mohali",
    state: "Punjab",
  },
  {
    id: "thapar-patiala",
    name: "Thapar Institute of Engineering & Technology",
    city: "Patiala",
    state: "Punjab",
  },
  {
    id: "pu-chandigarh",
    name: "Panjab University (PU)",
    city: "Chandigarh",
    state: "Chandigarh",
  },
  {
    id: "nit-srinagar",
    name: "National Institute of Technology (NIT Srinagar)",
    city: "Srinagar",
    state: "Jammu & Kashmir",
  },
  {
    id: "ku-srinagar",
    name: "University of Kashmir",
    city: "Srinagar",
    state: "Jammu & Kashmir",
  },
  {
    id: "amity-noida",
    name: "Amity University",
    city: "Noida",
    state: "Uttar Pradesh",
  },
  {
    id: "bits-pilani",
    name: "BITS Pilani",
    city: "Pilani",
    state: "Rajasthan",
  },
  {
    id: "iit-bombay",
    name: "IIT Bombay",
    city: "Mumbai",
    state: "Maharashtra",
  },
  {
    id: "iit-roorkee",
    name: "IIT Roorkee",
    city: "Roorkee",
    state: "Uttarakhand",
  },
];

export const STUDY_YEAR_OPTIONS = [
  "1st Year (Freshman)",
  "2nd Year (Sophomore)",
  "3rd Year (Junior)",
  "4th Year (Senior / Final Year)",
  "5th Year (Dual Degree / Integrated)",
  "Postgraduate (Masters / PhD)",
];

export const POPULAR_DEPARTMENTS = [
  "Computer Science & Engineering (CSE)",
  "Information Technology (IT)",
  "Electronics & Communication (ECE)",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Biotechnology",
  "Business Administration (MBA / BBA)",
  "Commerce & Economics (B.Com)",
  "Computer Applications (BCA / MCA)",
  "Design & Architecture",
  "Pharmacy & Health Sciences",
  "Arts & Humanities",
  "Law & Legal Studies",
];
