// =============================================================================
// Trips API — Client-side helpers
// =============================================================================

const API_BASE =
  typeof window !== "undefined"
    ? (import.meta.env.VITE_API_URL as string | undefined) ||
      "http://localhost:3000"
    : "http://localhost:3000";

export interface City {
  id: string;
  name: string;
  country: string;
  country_code: string;
  region: string | null;
  popularity_score: number;
  cost_index: number | null;
  tags: string[];
  images: string[];
  description: string | null;
}

export interface TripStop {
  id: string;
  trip_id: string;
  city_id: string;
  city_name: string;
  country: string;
  arrival_date: string | null;
  departure_date: string | null;
  notes: string | null;
  budget: number | null;
  order_index: number;
  images: string[];
  tags: string[];
  cost_index: number | null;
}

export interface Trip {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  total_budget: number | null;
  currency: string;
  trip_status: string;
  created_at: string;
  stop_count?: number;
  stops?: TripStop[];
}

// ─── Cities ─────────────────────────────────────────────────────────────────

export const fetchCities = async (search = "", limit = 9): Promise<City[]> => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (search) params.set("search", search);
  const res = await fetch(`${API_BASE}/api/trips/cities?${params}`);
  if (!res.ok) throw new Error("Failed to fetch cities");
  const json = await res.json();
  return json.data?.cities ?? [];
};

// ─── Trips ───────────────────────────────────────────────────────────────────

export const createTrip = async (
  token: string,
  body: {
    title: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    total_budget?: number;
    currency?: string;
  }
): Promise<Trip> => {
  const res = await fetch(`${API_BASE}/api/trips`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create trip");
  return json.data.trip;
};

export const fetchTrip = async (
  token: string,
  tripId: string
): Promise<Trip> => {
  const res = await fetch(`${API_BASE}/api/trips/${tripId}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch trip");
  return json.data.trip;
};

export const fetchUserTrips = async (token: string): Promise<Trip[]> => {
  const res = await fetch(`${API_BASE}/api/trips`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch trips");
  return json.data?.trips ?? [];
};

// ─── Trip Stops ───────────────────────────────────────────────────────────────

export const addTripStop = async (
  token: string,
  tripId: string,
  body: {
    city_id: string;
    arrival_date?: string;
    departure_date?: string;
    notes?: string;
    budget?: number;
  }
): Promise<TripStop> => {
  const res = await fetch(`${API_BASE}/api/trips/${tripId}/stops`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to add stop");
  return json.data.stop;
};

export const updateTripStop = async (
  token: string,
  tripId: string,
  stopId: string,
  body: {
    arrival_date?: string;
    departure_date?: string;
    notes?: string;
    budget?: number;
    order_index?: number;
  }
): Promise<TripStop> => {
  const res = await fetch(`${API_BASE}/api/trips/${tripId}/stops/${stopId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update stop");
  return json.data.stop;
};

export const deleteTripStop = async (
  token: string,
  tripId: string,
  stopId: string
): Promise<void> => {
  const res = await fetch(`${API_BASE}/api/trips/${tripId}/stops/${stopId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message || "Failed to delete stop");
  }
};

// ─── Activities ───────────────────────────────────────────────────────────────

export interface Activity {
  id: string;
  stop_id: string;
  day_number: number;
  order_index: number;
  title: string;
  description: string | null;
  expense: number;
  created_at: string;
  updated_at: string;
}

export const fetchActivities = async (
  token: string,
  tripId: string,
  stopId: string
): Promise<Activity[]> => {
  const res = await fetch(`${API_BASE}/api/trips/${tripId}/stops/${stopId}/activities`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch activities");
  return json.data?.activities ?? [];
};

export const addActivity = async (
  token: string,
  tripId: string,
  stopId: string,
  body: { day_number: number; title: string; description?: string; expense?: number }
): Promise<Activity> => {
  const res = await fetch(`${API_BASE}/api/trips/${tripId}/stops/${stopId}/activities`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to add activity");
  return json.data.activity;
};

export const updateActivity = async (
  token: string,
  tripId: string,
  stopId: string,
  activityId: string,
  body: { title?: string; description?: string; expense?: number; day_number?: number }
): Promise<Activity> => {
  const res = await fetch(`${API_BASE}/api/trips/${tripId}/stops/${stopId}/activities/${activityId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update activity");
  return json.data.activity;
};

export const deleteActivityApi = async (
  token: string,
  tripId: string,
  stopId: string,
  activityId: string
): Promise<void> => {
  const res = await fetch(`${API_BASE}/api/trips/${tripId}/stops/${stopId}/activities/${activityId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message || "Failed to delete activity");
  }
};
