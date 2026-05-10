// =============================================================================
// Trip Notes Service — Database Queries
// =============================================================================

import { query } from "../../config/database.js";

export interface NoteRow {
  id: string;
  trip_id: string;
  trip_stop_id: string | null;
  user_id: string;
  title: string | null;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  stop_city_name?: string;
}

export async function getNotesForTrip(tripId: string, userId: string): Promise<NoteRow[]> {
  const result = await query(
    `SELECT n.id, n.trip_id, n.trip_stop_id, n.user_id, n.title, n.content,
            n.is_pinned, n.created_at, n.updated_at,
            c.name AS stop_city_name
     FROM trip_notes n
     LEFT JOIN trip_stops ts ON ts.id = n.trip_stop_id
     LEFT JOIN cities c ON c.id = ts.city_id
     WHERE n.trip_id = $1 AND n.user_id = $2 AND n.deleted_at IS NULL
     ORDER BY n.is_pinned DESC, n.created_at DESC`,
    [tripId, userId]
  );
  return result.rows;
}

export async function addNote(
  tripId: string, userId: string,
  data: { title?: string; content: string; trip_stop_id?: string }
): Promise<NoteRow> {
  const result = await query(
    `INSERT INTO trip_notes (trip_id, user_id, title, content, trip_stop_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, trip_id, trip_stop_id, user_id, title, content, is_pinned, created_at, updated_at`,
    [tripId, userId, data.title || null, data.content, data.trip_stop_id || null]
  );
  return result.rows[0];
}

export async function updateNote(
  noteId: string, userId: string,
  data: { title?: string; content: string }
): Promise<NoteRow | null> {
  const result = await query(
    `UPDATE trip_notes SET title = $3, content = $4, updated_at = now()
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
     RETURNING id, trip_id, trip_stop_id, user_id, title, content, is_pinned, created_at, updated_at`,
    [noteId, userId, data.title || null, data.content]
  );
  return result.rows[0] || null;
}

export async function deleteNote(noteId: string, userId: string): Promise<boolean> {
  const result = await query(
    `UPDATE trip_notes SET deleted_at = now() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [noteId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function togglePin(noteId: string, userId: string): Promise<NoteRow | null> {
  const result = await query(
    `UPDATE trip_notes SET is_pinned = NOT is_pinned, updated_at = now()
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
     RETURNING id, trip_id, trip_stop_id, user_id, title, content, is_pinned, created_at, updated_at`,
    [noteId, userId]
  );
  return result.rows[0] || null;
}
