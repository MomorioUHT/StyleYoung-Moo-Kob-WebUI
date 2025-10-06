import { useState, useEffect } from "react";
import api from "../middleware/axios";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import { 
    errorNotification, 
    warningNotification, 
    successNotification 
} from "../middleware/displayer";

function AdminDashboard() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;

    // Verifier User
    const verifyUser = async () => {
        const token = localStorage.getItem("token");

        try {
            const res = await api.get("/verifyUser", {
                headers: {
                    'api-key': API_KEY,
                    Authorization: `Bearer ${token}` 
                },
            });

            if (!res.data.user.s_position) {
                navigate("/welcome")
            }
        } catch {
            errorNotification("การตรวจสอบสิทธิ์ล้มเหลว", "กรุณาเข้าสู่ระบบอีกครั้ง")
            navigate('/welcome')
        }
    };

    useEffect(() => {
        verifyUser();
    }, []);

    return (
        <div className="body-container">
            <p>ADMINISTRATOR TEST PAGE</p>
        </div>
    );
}

export default AdminDashboard;
