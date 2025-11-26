
import jwt from "jsonwebtoken"
import { db } from "../db/db.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({
                message:"Unauthorized - No token Provided"
            })
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            
        } catch (error) {
            return res.status(401).json({
                message:"Unauthorized - invalid token "
            })
        }

        const user = await db.user.findUnique({
            where:{
                id:decoded.id
            },
            select:{
                id:true,
                name:true,
                email:true,
                role:true,
                created_at:true
            }
        })

        if(!user){
            return res.status(404).json({
                message:"User not found "
            })
        }

        req.user = user;
        next();
        
    } catch (error) {
        console.error("Error finding user:", error)
        res.status(500).json({
            error:"Error Finding User"
        })
    }
}


export const checkAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({
                message:"Unauthorized - No token Provided"
            })
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            
        } catch (error) {
            return res.status(401).json({
                message:"Unauthorized - invalid token "
            })
        }

        const user = await db.user.findUnique({
            where:{
                id:decoded.id
            },
            select:{
                role:true
            }
        })

        if(!user || user.role !== "admin"){
            return res.status(403).json({
                message:" Access Denied"
            })
        }

        next();
        
    } catch (error) {
        console.error("Error finding user:", error)
        res.status(500).json({
            error:"Error Finding User"
        })
    }
}
