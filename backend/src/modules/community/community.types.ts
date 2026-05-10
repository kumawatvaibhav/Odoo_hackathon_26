// =============================================================================
// Community Types
// =============================================================================

export interface CommunityPostRow {
  id: string;
  trip_id: string;
  author_id: string;
  title: string;
  body: string | null;
  share_slug: string | null;
  cover_image_url: string | null;
  like_count: number;
  comment_count: number;
  view_count: number;
  is_featured: boolean;
  is_published: boolean;
  deleted_at: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  author_first_name?: string;
  author_last_name?: string;
  author_email?: string;
  author_profile_photo_url?: string | null;
  trip_title?: string;
  trip_city?: string;
  trip_country?: string;
}

export interface SafeCommunityPost {
  id: string;
  trip_id: string;
  title: string;
  body: string | null;
  share_slug: string | null;
  cover_image_url: string | null;
  like_count: number;
  comment_count: number;
  view_count: number;
  is_featured: boolean;
  published_at: string;
  author: {
    id: string;
    first_name: string;
    last_name: string;
    profile_photo_url: string | null;
  };
  trip: {
    title: string;
    city: string | null;
    country: string | null;
  };
}

export interface CommunityQueryParams {
  search?: string;
  groupBy?: "city" | "country" | "author";
  filter?: "featured" | "recent" | "popular";
  sortBy?: "published_at" | "like_count" | "view_count" | "comment_count";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CreatePostBody {
  trip_id: string;
  title: string;
  body?: string;
  cover_image_url?: string;
}
