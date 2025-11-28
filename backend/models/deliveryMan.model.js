import { Schema, model } from "mongoose";

const deliveryManSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  confirmPassword: { type: String, required: true },
  role: { type: String, enum: ["user", "admin", "deliveryMan"], default: "deliveryMan" },
  status: {
    type: String,
    enum: ["available", "busy"],
    default: "available"
  },
  currentOrderId: {
    type: Schema.Types.ObjectId,
    ref: "order",
    default: null
  }
}, { timestamps: true });

export const DeliveryManModel = model("DeliveryMan", deliveryManSchema);
