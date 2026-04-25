import { addDays, format, startOfMonth, subDays } from "date-fns";

export type SlotStatus = "available" | "pending" | "confirmed" | "blocked";
export type BookingStatus = "pending" | "confirmed" | "rejected" | "completed" | "offline" | "cancelled";
export type Slot = "morning" | "night";
export type PaymentMethod = "cash" | "upi" | "card" | "bank" | "cheque";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";

export interface PaymentEntry {
  id: string;
  amount: number;
  method: PaymentMethod;
  date: string; // ISO
  note?: string;
  reference?: string;
}

export interface Booking {
  id: string;
  hallId: string;
  hallName: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  date: string; // ISO
  slot: Slot;
  amount: number;
  advancePaid: number;
  status: BookingStatus;
  source: "online" | "offline";
  createdAt: string;
  notes?: string;
  payments?: PaymentEntry[];
  guests?: number;
  functionType?: string;
}

export interface Hall {
  id: string;
  name: string;
  city: string;
  address: string;
  category: string;
  foodType: string;
  morningPrice: number;
  nightPrice: number;
  capacity: number;
  rating: number;
  reviews: number;
  active: boolean;
  amenities: string[];
  description: string;
  bookingsThisMonth: number;
  revenueThisMonth: number;
  photo?: string;
  checkInTime?: string;
  checkOutTime?: string;
  morningSlotTime?: string;
  nightSlotTime?: string;
  policies?: string[];
  hallType?: string;
  supportNumber?: string;
}

export const HALL_TYPES = ["Wedding Hall", "Lawn", "Banquet Hall", "Convention Center", "Marriage Garden"];

export const DEFAULT_POLICIES = [
  "Guests must arrive on time as per booking slot",
  "Keep the hall premises clean at all times",
  "Do not waste food — serve only required quantity",
  "Night bookings must vacate the hall promptly next morning",
  "No outside catering without prior permission",
  "Loud music allowed only till 10:00 PM as per local rules",
  "Damages to property will be charged from advance/security",
  "Smoking and alcohol are strictly prohibited inside the hall",
  "Decoration nails/tape must not damage walls or pillars",
  "Parking only in designated areas",
];

export interface Review {
  id: string;
  hallId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
}

export const halls: Hall[] = [
  {
    id: "h1",
    name: "Kareem Hall",
    city: "Amravati",
    address: "Habib Nagar, Main Road",
    category: "Wedding",
    foodType: "Non-Veg Only",
    morningPrice: 40000,
    nightPrice: 60000,
    capacity: 7000,
    rating: 4.8,
    reviews: 32,
    active: true,
    amenities: ["AC", "Parking", "Catering", "DJ", "Decoration", "Generator", "CCTV"],
    description: "Premium wedding hall with modern amenities and elegant interiors.",
    bookingsThisMonth: 18,
    revenueThisMonth: 720000,
    checkInTime: "09:00 AM",
    checkOutTime: "Next day 09:00 AM",
    morningSlotTime: "9:00 AM – 4:00 PM",
    nightSlotTime: "7:00 PM – 5:00 AM",
    policies: [
      "Guests must arrive on time as per booking slot",
      "Keep the hall premises clean at all times",
      "Do not waste food — serve only required quantity",
      "Night bookings must vacate the hall by 9:00 AM next morning",
      "Loud music allowed only till 10:00 PM",
    ],
    hallType: "Wedding Hall",
    supportNumber: "+919876500001",
  },
  {
    id: "h2",
    name: "Royal Garden Lawns",
    city: "Amravati",
    address: "Camp Area, Near Station",
    category: "Reception",
    foodType: "Veg & Non-Veg",
    morningPrice: 35000,
    nightPrice: 55000,
    capacity: 4500,
    rating: 4.6,
    reviews: 21,
    active: true,
    amenities: ["Parking", "Catering", "Decoration", "Generator"],
    description: "Open-air garden lawn perfect for receptions and outdoor events.",
    bookingsThisMonth: 12,
    revenueThisMonth: 480000,
    checkInTime: "10:00 AM",
    checkOutTime: "Next day 08:00 AM",
    morningSlotTime: "10:00 AM – 4:00 PM",
    nightSlotTime: "7:00 PM – 4:00 AM",
    policies: [
      "Keep the lawn premises clean",
      "Do not waste food",
      "Vacate promptly after night booking",
    ],
    hallType: "Lawn",
    supportNumber: "+919876500002",
  },
];

const today = new Date();
const fmt = (d: Date) => format(d, "yyyy-MM-dd");
const monthStart = startOfMonth(today);

export const bookings: Booking[] = [
  { id: "C45A95", hallId: "h1", hallName: "Kareem Hall", customerName: "Faizan Khan", customerPhone: "+917219366167", customerAddress: "Rajapeth, Amravati", date: fmt(addDays(today, 5)), slot: "night", amount: 60000, advancePaid: 3000, status: "pending", source: "online", createdAt: fmt(subDays(today, 1)) },
  { id: "3502B9", hallId: "h1", hallName: "Kareem Hall", customerName: "Rahul Sharma", customerPhone: "+919823456789", customerAddress: "Sai Nagar, Amravati", date: fmt(addDays(today, 22)), slot: "night", amount: 60000, advancePaid: 15000, status: "confirmed", source: "online", createdAt: fmt(subDays(today, 4)) },
  { id: "34FE57", hallId: "h1", hallName: "Kareem Hall", customerName: "Priya Patil", customerPhone: "+919812345670", customerAddress: "Camp, Amravati", date: fmt(addDays(today, 22)), slot: "morning", amount: 40000, advancePaid: 10000, status: "confirmed", source: "online", createdAt: fmt(subDays(today, 6)) },
  { id: "9C7266", hallId: "h1", hallName: "Kareem Hall", customerName: "Mohammed Ali", customerPhone: "+919876543210", customerAddress: "Frezarpura, Amravati", date: fmt(addDays(today, 9)), slot: "morning", amount: 40000, advancePaid: 8000, status: "confirmed", source: "offline", createdAt: fmt(subDays(today, 2)) },
  { id: "9C7055", hallId: "h2", hallName: "Royal Garden Lawns", customerName: "Anjali Deshmukh", customerPhone: "+919765432109", customerAddress: "Badnera Road", date: fmt(addDays(today, 4)), slot: "morning", amount: 35000, advancePaid: 5000, status: "confirmed", source: "online", createdAt: fmt(subDays(today, 3)) },
  { id: "9C6FF4", hallId: "h1", hallName: "Kareem Hall", customerName: "Suresh Kale", customerPhone: "+919654321098", customerAddress: "Gandhi Nagar", date: fmt(addDays(today, 2)), slot: "morning", amount: 40000, advancePaid: 12000, status: "confirmed", source: "online", createdAt: fmt(subDays(today, 5)) },
  { id: "9C6F56", hallId: "h1", hallName: "Kareem Hall", customerName: "Imran Sheikh", customerPhone: "+919543210987", customerAddress: "Mardi Road", date: fmt(addDays(today, 0)), slot: "morning", amount: 40000, advancePaid: 20000, status: "confirmed", source: "online", createdAt: fmt(subDays(today, 8)) },
  { id: "8B22A1", hallId: "h1", hallName: "Kareem Hall", customerName: "Neha Joshi", customerPhone: "+919432109876", customerAddress: "Walgaon Road", date: fmt(addDays(today, 7)), slot: "night", amount: 60000, advancePaid: 0, status: "pending", source: "online", createdAt: fmt(today) },
  { id: "7A11B3", hallId: "h2", hallName: "Royal Garden Lawns", customerName: "Vikas Patel", customerPhone: "+919321098765", customerAddress: "Tapovan Road", date: fmt(addDays(today, 14)), slot: "night", amount: 55000, advancePaid: 10000, status: "confirmed", source: "offline", createdAt: fmt(subDays(today, 7)), notes: "Walk-in customer, paid cash advance" },
  { id: "6F90C2", hallId: "h1", hallName: "Kareem Hall", customerName: "Arjun Reddy", customerPhone: "+919210987654", customerAddress: "Vidya Nagar", date: fmt(subDays(today, 10)), slot: "night", amount: 60000, advancePaid: 60000, status: "completed", source: "online", createdAt: fmt(subDays(today, 25)) },
  { id: "5E80D4", hallId: "h1", hallName: "Kareem Hall", customerName: "Kavita Singh", customerPhone: "+919109876543", customerAddress: "Shivaji Nagar", date: fmt(subDays(today, 4)), slot: "morning", amount: 40000, advancePaid: 40000, status: "completed", source: "online", createdAt: fmt(subDays(today, 30)) },
];

export const reviews: Review[] = [
  { id: "r1", hallId: "h1", customerName: "Arjun Reddy", rating: 5, comment: "Beautiful hall, excellent service. Staff was very helpful throughout the wedding.", date: fmt(subDays(today, 8)) },
  { id: "r2", hallId: "h1", customerName: "Kavita Singh", rating: 5, comment: "Loved the decoration and food quality. Highly recommended!", date: fmt(subDays(today, 3)) },
  { id: "r3", hallId: "h1", customerName: "Mohammed Yusuf", rating: 4, comment: "Great venue, parking was a bit tight on busy days.", date: fmt(subDays(today, 15)) },
  { id: "r4", hallId: "h2", customerName: "Sneha Kale", rating: 5, comment: "Lovely garden, perfect for outdoor reception.", date: fmt(subDays(today, 6)) },
];

export const customers: Customer[] = Array.from(
  bookings.reduce((map, b) => {
    const existing = map.get(b.customerPhone);
    if (existing) {
      existing.totalBookings += 1;
      existing.totalSpent += b.amount;
      if (b.date > existing.lastBooking) existing.lastBooking = b.date;
    } else {
      map.set(b.customerPhone, {
        id: b.customerPhone,
        name: b.customerName,
        phone: b.customerPhone,
        address: b.customerAddress,
        totalBookings: 1,
        totalSpent: b.amount,
        lastBooking: b.date,
      });
    }
    return map;
  }, new Map<string, Customer>()).values()
);

// Revenue trend last 7 days
export const revenueTrend = Array.from({ length: 7 }).map((_, i) => {
  const d = subDays(today, 6 - i);
  const dayBookings = bookings.filter((b) => b.date === fmt(d) && b.status !== "rejected");
  return {
    day: format(d, "EEE"),
    date: fmt(d),
    revenue: dayBookings.reduce((s, b) => s + b.amount, 0),
  };
});

export const monthlyRevenue = Array.from({ length: 6 }).map((_, i) => {
  const d = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
  return {
    month: format(d, "MMM"),
    revenue: 250000 + Math.floor(Math.random() * 600000),
  };
});

export function formatINR(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export function dayStatusFor(dateStr: string, hallId?: string): {
  status: "available" | "morning-only" | "night-only" | "full" | "pending" | "past";
  bookings: Booking[];
} {
  const d = new Date(dateStr);
  const todayD = new Date(format(today, "yyyy-MM-dd"));
  if (d < todayD) return { status: "past", bookings: [] };
  const dayBookings = bookings.filter(
    (b) => b.date === dateStr && (!hallId || b.hallId === hallId) && b.status !== "rejected" && b.status !== "completed"
  );
  if (dayBookings.length === 0) return { status: "available", bookings: [] };
  const hasPending = dayBookings.some((b) => b.status === "pending");
  const morning = dayBookings.find((b) => b.slot === "morning");
  const night = dayBookings.find((b) => b.slot === "night");
  if (morning && night) return { status: "full", bookings: dayBookings };
  if (hasPending) return { status: "pending", bookings: dayBookings };
  if (morning) return { status: "morning-only", bookings: dayBookings };
  if (night) return { status: "night-only", bookings: dayBookings };
  return { status: "available", bookings: dayBookings };
}

export { monthStart };
