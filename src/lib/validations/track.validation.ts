import { z } from 'zod';

export const createTrackSchema = z.object({
  name: z.string().min(1, 'Track name is required').max(255, 'Track name must be less than 255 characters'),
  description: z.string().optional().nullable(),
});

export const updateTrackSchema = z.object({
  name: z.string().min(1, 'Track name is required').max(255, 'Track name must be less than 255 characters').optional(),
  description: z.string().optional().nullable(),
});

export const trackIdSchema = z.object({
  id: z.string().uuid('Invalid track ID format'),
});

export type CreateTrackInput = z.infer<typeof createTrackSchema>;
export type UpdateTrackInput = z.infer<typeof updateTrackSchema>;
export type TrackIdInput = z.infer<typeof trackIdSchema>;
