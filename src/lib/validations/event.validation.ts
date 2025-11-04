import z from "zod";

export const createEventSchema = z.object({
    trackId : z.string().uuid("Invalid trackId fomart"),
    title: z
        .string()
        .min(1, "Event title is required")
        .max(255, "Title must be less than 255 characters"),
    description: z.string().optional().nullable(),
    eventDate: z.string().datetime("Invalid date format"),
    location: z
    .string()
    .max(255, "Location must be less than 255 characters")
    .optional()
    .nullable(),
})

export const updateEventSchema = z.object({
    title: z
      .string()
      .min(1, "Event title is required")
      .max(255, "Title must be less than 255 characters")
      .optional(),
    description: z.string().optional().nullable(),
    eventDate: z.string().datetime("Invalid date format").optional(),
    location: z
      .string()
      .max(255, "Location must be less than 255 characters")
      .optional()
      .nullable(),
  })

export const eventIdSchema = z.object({
    id: z.string().uuid("Invalid event ID format"),
  })

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type EventIdInput = z.infer<typeof eventIdSchema>