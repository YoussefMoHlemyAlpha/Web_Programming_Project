import { userModel } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, address } = req.body;
        // Validate first and last name length
        if (firstName.length < 3) {
            return res.status(400).json({ message: "First name must be at least 3 characters long" });
        }
        if (lastName.length < 3) {
            return res.status(400).json({ message: "Last name must be at least 3 characters long" });
        }
        if(password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        if(password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        if(phone.length !== 11) {
            return res.status(400).json({ message: "Phone number must be 11 digits long" });
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            firstName, lastName, email, password: hashedPassword, confirmPassword: hashedPassword, phone, address
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // First, try to find user in userModel
        let user = await userModel.findOne({ email });
        let isDeliveryMan = false;

        // If not found in userModel, check DeliveryManModel
        if (!user) {
            const { DeliveryManModel } = await import("../models/deliveryMan.model.js");
            user = await DeliveryManModel.findOne({ email });
            isDeliveryMan = true;
        }

        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

        // Send back token and non-sensitive user data
        const { password: _, confirmPassword: __, ...userData } = user._doc;
        res.status(200).json({ token, user: userData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};