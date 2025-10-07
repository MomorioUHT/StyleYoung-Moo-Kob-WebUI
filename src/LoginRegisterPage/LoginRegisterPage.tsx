import { useState, useEffect } from "react";
import "./LoginRegisterPage.css";
import api from "../middleware/axios";
import { useNavigate } from "react-router-dom";
import {
    errorNotification,
    warningNotification,
    successNotification
} from "../middleware/displayer";

interface EmojiItem {
    emoji: string;
    style: React.CSSProperties;
}

function LoginRegister() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;

    const [activeTab, setActiveTab] = useState("login");
    const [emojis, setEmojis] = useState<EmojiItem[]>([]);

    // Verifier User
    const verifyUser = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
      
        try {
            const res = await api.get("/verifyUser", {
                headers: {
                    'api-key': API_KEY,
                    Authorization: `Bearer ${token}` 
                },
            });

            if (!res.data.user.s_position) {
                navigate("/home")
            } else {
                if (res.data.user.s_position === "Admin") {
                    navigate("/administrator/dashboard")
                } else if (res.data.user.s_position === "Warehouse") {
                    navigate("/warehouse/dashboard")
                } else if (res.data.user.s_position === "QC") {
                    navigate("/qc/dashboard")         
                } else if (res.data.user.s_position === "Production") {
                    navigate("/production/dashboard")
                } else if (res.data.user.s_position === "Sales") {
                    navigate("/sales/dashboard")          
                } else {
                    errorNotification("Page missing", "หน้าที่ร้องขอไม่พบในระบบ")
                }
            }
        } catch {
            errorNotification("การตรวจสอบสิทธิ์ล้มเหลว", "กรุณาเข้าสู่ระบบอีกครั้ง")
        }
    };

    // User Login
    const customerLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const username = (e.target as any)[0].value;
        const password = (e.target as any)[1].value;

        if (username.length < 5 || username.length > 15) {
            warningNotification("ชื่อผู้ใช้ไม่ถูกต้อง", "ชื่อผู้ใช้ต้องมีความยาว 5-15 ตัวอักษร");
            return;
        }

        try {
            const res = await api.post("/loginCustomer", { username, password }, {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": API_KEY
                },
            });
            const data = res.data;

            if (data.message === "login successful") {
                successNotification("เข้าสู่ระบบสำเร็จ", "กำลังตรวจสอบสิทธิ์ของคุณ...");
                api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
                localStorage.setItem("token", data.token);
                setTimeout(() => verifyUser(), 1000);
            } else {
                errorNotification("ไม่สามารถเข้าสู่ระบบได้","username หรือ password ไม่ถูกต้อง");
            }
        } catch (err: any) {
            errorNotification("ไม่สามารถเข้าสู่ระบบได้","username หรือ password ไม่ถูกต้อง");
        }
    };

    const staffLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const username = (e.target as any)[0].value;
        const password = (e.target as any)[1].value;

        // ตรวจสอบ username
        if (username.length < 5 || username.length > 15) {
            warningNotification("ชื่อผู้ใช้ไม่ถูกต้อง", "ชื่อผู้ใช้ต้องมีความยาว 5-15 ตัวอักษร");
            return;
        }

        try {
            const res = await api.post("/loginStaff", { username, password }, {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": API_KEY
                },
            });
            const data = res.data;

            if (data.message === "login successful") {
                successNotification("เข้าสู่ระบบพนักงานสำเร็จ", "กำลังตรวจสอบสิทธิ์ของคุณ...");
                api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
                localStorage.setItem("token", data.token);
                setTimeout(() => verifyUser(), 1000);
            } else {
                errorNotification("ไม่สามารถเข้าสู่ระบบได้","username หรือ password ไม่ถูกต้อง");
            }
        } catch (err: any) {
            errorNotification("ไม่สามารถเข้าสู่ระบบได้","username หรือ password ไม่ถูกต้อง");
        }
    };

    // Register Customer
    const customerRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        const [
            firstname, lastname, phone, address, username, password, confirmPassword,
        ] = (e.target as any);

        if (username.value.length < 5 || username.value.length > 15) {
            warningNotification("ชื่อผู้ใช้ไม่ถูกต้อง", "ชื่อผู้ใช้ต้องมีความยาว 5-15 ตัวอักษร");
            return;
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone.value)) {
            warningNotification("เบอร์โทรไม่ถูกต้อง", "เบอร์โทรต้องมีเลข 10 หลักเท่านั้น");
            return;
        }

        if (password.length < 7 || password.length > 20) {
            warningNotification("ข้อมูลไม่ถูกต้อง", "รหัสผ่านต้องมีความยาวระหว่าง 7 ถึง 20 ตัวอักษร");
            return;
        } else if (password.value !== confirmPassword.value) {
            warningNotification("รหัสผ่านไม่ตรงกัน", "กรุณาตรวจสอบอีกครั้ง");
            return;
        }

        try {
            const res = await api.post("/registerCustomer", {
                firstname: firstname.value,
                lastname: lastname.value,
                phone: phone.value,
                address: address.value,
                username: username.value,
                password: password.value,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": API_KEY
                },
            });

            if (res.data.message === "failed to register user") {
                errorNotification("ไม่สามารถสมัครผู้ใช้งานนี้ได้", "กรุณาลองอีกครั้ง");
            }
            successNotification("สมัครสมาชิกสำเร็จ", "กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ");
            setActiveTab("login");
        } catch (err: any) {
            errorNotification("สมัครสมาชิกไม่สำเร็จ", err.message);
        }
    };

    useEffect(() => {
        verifyUser();

        const emojiList = ["🐷", "🥓"];
        const tempEmojis: EmojiItem[] = [];

        for (let i = 0; i < 30; i++) {
            const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
            const style: React.CSSProperties = {
                left: Math.random() * 100 + "vw",
                animationDuration: 5 + Math.random() * 10 + "s",
                fontSize: 12 + Math.random() * 24 + "px"
            };
            tempEmojis.push({ emoji, style });
        }

        setEmojis(tempEmojis);
    }, []);

    return (
        <div className="body-container">

            {emojis.map((e, idx) => (
                <span key={idx} className="floating-emoji" style={e.style}>
                    {e.emoji}
                </span>
            ))}

            <div className="container">
                <img src="/Logo.png" alt='Logo' height='150px' />

                <div className="tabs">
                    <button
                        className={activeTab === "login" ? "active" : ""}
                        onClick={() => setActiveTab("login")}
                    >
                        เข้าสู่ระบบลูกค้า
                    </button>

                    <button
                        className={activeTab === "staffLogin" ? "active" : ""}
                        onClick={() => setActiveTab("staffLogin")}
                    >
                        เข้าสู่ระบบพนักงาน
                    </button>
                </div>

                {/* Login Form */}
                <form className={`form ${activeTab === "login" ? "active" : ""}`} onSubmit={customerLogin}>
                    <label>ชื่อผู้ใช้</label>
                    <input type="username" placeholder="ชื่อผู้ใช้" />

                    <label>รหัสผ่าน</label>
                    <input type="password" placeholder="รหัสผ่าน" required />

                    <button type="submit" className="btn">เข้าสู่ระบบ</button>
                </form>

                {/* Register Form */}
                <form className={`form ${activeTab === "register" ? "active" : ""}`} onSubmit={customerRegister}>
                    <label>ชื่อ</label>
                    <input type="text" placeholder="ชื่อ" required />

                    <label>นามสกุล</label>
                    <input type="text" placeholder="นามสกุล" required />

                    <label>เบอร์โทรศัพท์</label>
                    <input type="text" placeholder="เบอร์โทรศัพท์" required />

                    <label>ที่อยู่</label>
                    <textarea placeholder="ที่อยู่" required style={{ minHeight: "60px", resize: "vertical" }} />

                    <label>ชื่อผู้ใช้</label>
                    <input type="username" placeholder="ชื่อผู้ใช้" required />

                    <label>รหัสผ่าน</label>
                    <input type="password" placeholder="รหัสผ่าน" required />

                    <label>ยืนยันรหัสผ่าน</label>
                    <input type="password" placeholder="ยืนยันรหัสผ่าน" required />

                    <button type="submit" className="btn">ลงทะเบียนผู้ใช้งาน</button>
                </form>

                {/* Staff Login Form */}
                <form className={`form ${activeTab === "staffLogin" ? "active" : ""}`} onSubmit={staffLogin}>
                    <label>ชื่อผู้ใช้พนักงาน</label>
                    <input type="username" placeholder="ชื่อผู้ใช้พนักงาน" required />

                    <label>รหัสผ่าน</label>
                    <input type="password" placeholder="รหัสผ่าน" required />

                    <button type="submit" className="btn">เข้าสู่ระบบพนักงาน</button>
                </form>

                <p className="register-text">
                    ไม่มีบัญชีผู้ใช้ใช่ไหม?{" "}
                    <span className="register-link" onClick={() => setActiveTab("register")}>
                        ลงทะเบียน
                    </span>
                </p>
            </div>
        </div>
    );
}

export default LoginRegister;
