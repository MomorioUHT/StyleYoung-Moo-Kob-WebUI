import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import { 
    errorNotification, 
    warningNotification, 
    successNotification 
} from "../middleware/displayer";


function AdminDashboard() {
    const navigate = useNavigate();

    // Verifier User
    const verifyUser = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await axios.get("/verifyMe", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { role } = res.data;
            if (role === "User") {
                navigate("/Home");
            } else if (role === "Admin") {
                navigate("/Dashboard");
            } else {
                notification.info({ message: "Unknown role" });
            }
        } catch {
            errorNotification("การตรวจสอบสิทธิ์ล้มเหลว", "กรุณาเข้าสู่ระบบอีกครั้ง")
        }
    };

    return (
        <div className="body-container">
            <p1>STAFF TEST PAGE</p1>
        </div>
    );
}

export default AdminDashboard;
