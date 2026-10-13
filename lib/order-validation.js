import { z } from "zod";

const phonePattern = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,18}$/;
export const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, "Please enter your full name").max(80),
    address: z
      .string()
      .trim()
      .min(8, "Please enter a complete delivery address")
      .max(240),
    phone: z
      .string()
      .trim()
      .regex(phonePattern, "Please enter a valid phone number"),
    instructions: z.string().trim().max(300).optional().default(""),
  }),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Your cart is empty")
    .max(30),
});
export const updateOrderSchema = z
  .object({
    status: z
      .enum([
        "ORDER_RECEIVED",
        "PREPARING",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ])
      .optional(),
    customer: orderSchema.shape.customer.partial().optional(),
  })
  .refine((value) => value.status || value.customer, {
    message: "Provide a status or customer update",
  });
