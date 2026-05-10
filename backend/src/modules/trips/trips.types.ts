// =============================================================================
// Trips Module — Types
// =============================================================================

export interface CreateTripBody {
  title: string;
  description?: string;
  start_date?: string;   // ISO date string
  end_date?: string;     // ISO date string
  total_budget?: number;
  currency?: string;
}

export interface CreateTripStopBody {
  city_id: string;
  arrival_date?: string;
  departure_date?: string;
  notes?: string;
  budget?: number;
  order_index?: number;
}

export interface UpdateTripStopBody {
  arrival_date?: string;
  departure_date?: string;
  notes?: string;
  budget?: number;
  order_index?: number;
}

export interface CreateActivityBody {
  day_number: number;
  title: string;
  description?: string;
  expense?: number;
  order_index?: number;
}

export interface UpdateActivityBody {
  title?: string;
  description?: string;
  expense?: number;
  day_number?: number;
  order_index?: number;
}
