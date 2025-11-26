import jwt from "jsonwebtoken"
import  bcrypt from "bcryptjs";
import { db } from "../db/db.js";
import pkg from '@prisma/client';
const { Role } = pkg;


export const register = async (req, res) => {
    const {email, password, name, address} = req.body;

    try {
        if (!email || !password || !name) {
           return res.status(400).json({ error: "All fields are required" });
        }
        const existingUser = await db.user.findUnique({
            where:{
                email
            }
        })

        if(existingUser){
            return res.status(400).json({
                error:"User already Exists"
            })
        }

        const hashedPassword =  await bcrypt.hash(password, 10);

        const newUser = await db.user.create({
            data:{
                email,
                password:hashedPassword,
                name,
                role:Role.normal_user,
                address:address
            }
        })

        const token = jwt.sign({id:newUser.id}, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })
        
        res.cookie("jwt", token, {
            httpOnly:true,
            sameSite:"strict",
            secure:process.env.NODE_ENV !== "development",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        })

        res.status(201).json({
         success:true,
         message:"User creatred successfully",
         user:{
            id:newUser.id,
            email:newUser.email,
            name:newUser.name,
            role:newUser.role,
            address:newUser.address,
         }   
        })
    } catch (error) {
        console.error("Error creating user:", error)
        res.status(500).json({
            error:"Error Creating User"
        })
    }

}

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        if (!email || !password ) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const user = await db.user.findUnique({
            where:{
                email
            }
        })

        if(!user){
            return res.status(401).json({
                error:"user not found"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
             return res.status(401).json({
                error:"Invalid credentials"
            })
        }

        const token = jwt.sign({id:user.id}, process.env.JWT_SECRET, {
            expiresIn: "7d"
        }) 

         res.cookie("jwt", token, {
            httpOnly:true,
            sameSite:"strict",
            secure:process.env.NODE_ENV !== "development",
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days 
        })

        res.status(200).json({
         success:true,
         message:"User logged in successfully",
         user:{
            id:user.id,
            email:user.email,
            name:user.name,
            role:user.role,
            address:user.address,
            created_at:user.created_at
         }   
        })

    } catch (error) {
         console.error("Error Logging user:", error)
        res.status(500).json({
            error:"Error Logging User"
        })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly:true,
            sameSite:"strict",
            secure:process.env.NODE_ENV !== "development"
        })

        res.status(201).json({
         success: true,
         message:"User logged out successfully",   
        })

    } catch (error) {
        console.error("Error Logging out user:", error)
        res.status(500).json({
            error:"Error Logging out User"
        })
    }
}

export const check = async (req, res) => {
    try {
        // console.log("auth");
        
        res.status(200).json({
         success:true,
         message:"User authenticated successfully",
         user:req.user
        })
    } catch (error) {
        console.error("Error checking user:", error)
        res.status(500).json({
            error:"Error checking User"
        })
    }
}

export const changePassword = async (req, res) => {
  try {

    // console.log("change psd");
    

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "currentPassword and newPassword required" });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(String(currentPassword), user.password);
    if (!match) {
      return res.status(403).json({ success: false, message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(String(newPassword), 10);
    await db.user.update({
      where: { id: userId },
      data: {
        password: hashed,
      },
    });


    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("changePassword error:", err);
    return res.status(500).json({ success: false, message: "Error changing password" });
  }
};