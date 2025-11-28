import { Schema, Types, model } from "mongoose";

export const orderSchema = Schema({
  userId: {
    type: Types.ObjectId,
    ref: "user",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "Preparing", "onTheWay", "delivered", "cancelled"],
    default: "pending",
    required: true,
  },
  deliveryManId: {
    type: Types.ObjectId,
    ref: "DeliveryMan",
    default: null
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  payment: {
    method: { type: String, enum: ["Cash", "Card"], default: "Cash" },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    transactionId: { type: String },
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  items: [
    {
      menuItemId: { type: Types.ObjectId, ref: "menuItem" },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],


}, { timestamps: true })
export const OrderModel = model("order", orderSchema);