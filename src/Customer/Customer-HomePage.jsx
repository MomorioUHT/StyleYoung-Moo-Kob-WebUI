import { useState, useEffect } from "react";
import api from "../middleware/axios";
import { useNavigate } from "react-router-dom";
import { Layout, Menu, Breadcrumb, Avatar, Dropdown, theme, Space, Card, Spin, Input, } from "antd";
import { 
    errorNotification, 
    successNotification,
} from "../middleware/displayer";
import {
    HomeOutlined,
    ShoppingOutlined,
    ShoppingCartOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    MenuFoldOutlined,
} from "@ant-design/icons";
const { Sider, Header, Content } = Layout;

function CustomerHomePage() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const [availableProducts, setAvailableProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");

    const {
        token: { colorBgContainer },
    } = theme.useToken();

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
            if (!res.data.user) {
                navigate("/welcome")
            } else {
                setUserInfo(res.data.user)
            }
        } catch {
            errorNotification("การตรวจสอบสิทธิ์ล้มเหลว", "กรุณาเข้าสู่ระบบอีกครั้ง")
            navigate('/welcome')
        }
    };

    const fetchAvailableProducts = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        try {
            const res = await api.get("/productsForSale", {
                headers: {
                    'api-key': API_KEY,
                    Authorization: `Bearer ${token}` 
                },
            });
            setAvailableProducts(res.data);
        } catch {
            errorNotification("เกิดข้อผิดพลาด", "ไม่มีสินค้าในระบบ")
        } finally {
            setLoading(false)
        }
    };


    const menuItems = [
        { key: "home", icon: <HomeOutlined />, label: "หน้าหลัก" },
        { key: "cart", icon: <ShoppingCartOutlined />, label: "ตะกร้าของฉัน" },
        { key: "orders", icon: <ShoppingOutlined />, label: "คำสั่งซื้อของฉัน"},
    ];

    const userMenuItems = [
        { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
    ];

    const handleMenuClick = (e) => {
        if (e.key === "logout") {
            localStorage.removeItem("token");
            window.location.reload();
        } else {
            navigate(`/${e.key}`);
        }
    };

    useEffect(() => {
        verifyUser();
        fetchAvailableProducts();
    }, []);

    const handleAddToCart = (product) => {
        try {
            let cart = JSON.parse(localStorage.getItem("cart")) || [];

            const existingIndex = cart.findIndex((item) => item.p_id === product.p_id);

            if (existingIndex !== -1) {
                cart[existingIndex].quantity += 1;
            } else {
                cart.push({
                    p_id: product.p_id,
                    p_name: product.p_name,
                    p_price: product.p_price,
                    picture_url: product.picture_url,
                    quantity: 1,
                });
            }
            localStorage.setItem("cart", JSON.stringify(cart));

            successNotification("เพิ่มลงตะกร้าสำเร็จ", `${product.p_name} ถูกเพิ่มแล้ว!`);
        } catch (error) {
            errorNotification("เกิดข้อผิดพลาด", "ไม่สามารถเพิ่มสินค้าได้");
        }
    };

    return (
        <Layout style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={205}
                style={{
                    height: "100vh",
                    position: "fixed",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    background: "#001529",
                }}
            >
                <div
                    className="logo"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: 120,
                        margin: 16,
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        color: "#fff",
                        fontWeight: 600,
                        textAlign: "center",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                    }}
                >
                    {!collapsed && (
                        <img
                            src="/Logo.png"
                            alt="Logo2"
                            style={{
                                width: 70,
                                height: 70,
                                objectFit: "contain",
                                marginBottom: 8,
                                transition: "opacity 0.3s",
                            }}
                        />
                    )}
                    <span>{collapsed ? "STY" : "Styleyoung Moo Kob"}</span>
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={["home"]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{
                        background: "#001529",
                        borderRight: "none",
                    }}
                />
            </Sider>

            <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: "all 0.2s", height: "100vh" }}>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingInline: 16,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                    }}
                >
                    <div onClick={() => setCollapsed(!collapsed)} style={{ cursor: "pointer" }}>
                        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </div>

                    <Space size="middle" style={{ display: "flex", alignItems: "center" }}>
                        {userInfo && (
                            <span style={{ fontWeight: 500, fontSize: 15 }}>
                                {userInfo.c_firstname} {userInfo.c_lastname} ({userInfo.c_username})
                            </span>
                        )}
                        <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }}>
                            <Avatar style={{ backgroundColor: "#1677ff", cursor: "pointer" }} icon={<UserOutlined />} />
                        </Dropdown>
                    </Space>
                </Header>

                <Content
                    style={{
                        margin: "16px",
                        padding: 24,
                        background: colorBgContainer,
                        borderRadius: 8,
                        overflow: "auto",
                        height: "calc(100vh - 64px - 32px)",
                    }}
                >
                    <Breadcrumb style={{ marginBottom: 16 }}>
                        <Breadcrumb.Item>หน้าหลัก</Breadcrumb.Item>
                        <Breadcrumb.Item>สินค้า</Breadcrumb.Item>
                    </Breadcrumb>

                    <Input.Search
                        placeholder="ค้นหาสินค้า"
                        allowClear
                        enterButton="ค้นหา"
                        size="middle"
                        style={{ maxWidth: 350, marginBottom: 20 }}
                        onSearch={(value) => setSearchText(value)}
                        onChange={(e) => setSearchText(e.target.value)}
                        value={searchText}
                    />

                    {loading ? (
                        <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
                    ) : (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                                gap: "20px",
                                marginTop: "20px",
                            }}
                        >
                            {availableProducts
                                .flat()
                                .filter((item) => 
                                    item.p_name.toLowerCase().includes(searchText.toLowerCase())
                                )
                                .map((item) => (
                                <Card
                                    key={item.p_id}
                                    hoverable
                                    style={{
                                        textAlign: "center",
                                        minHeight: 280,
                                        borderRadius: 16,
                                        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "flex-start",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
                                    }}
                                >
                                    <img
                                        src={item.picture_url}
                                        alt={item.p_name}
                                        style={{
                                            width: 100,
                                            height: 100,
                                            objectFit: "contain",
                                            marginTop: 20,
                                            borderRadius: 8,
                                        }}
                                    />

                                    <h3 style={{ marginTop: 12, marginBottom: 8, fontWeight: 600, fontSize: 16 }}>
                                        {item.p_name}
                                    </h3>

                                    <div
                                        style={{
                                            borderTop: "1px solid #f0f0f0",
                                            margin: "12px auto 0",
                                            width: "80%",
                                            paddingTop: 8,
                                        }}
                                    >
                                        <p style={{ margin: 0, fontSize: 15, color: "#222", fontWeight: 500 }}>
                                            💰 ราคา:{" "}
                                            <span style={{ color: "#1677ff", fontWeight: 600 }}>
                                                {item.p_price}฿
                                            </span>
                                        </p>

                                        {item.p_quantity > 0 ? (
                                            <p
                                                style={{
                                                    margin: "4px 0 0",
                                                    fontSize: 14,
                                                    color: "#555",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                📦 สินค้าคงเหลือ:{" "}
                                                <span style={{ color: "#52c41a", fontWeight: 500 }}>
                                                    {item.p_quantity} ชิ้น
                                                </span>
                                            </p>
                                        ) : (
                                            <p
                                                style={{
                                                    margin: "4px 0 0",
                                                    fontSize: 14,
                                                    color: "#ff4d4f",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                ❌ สินค้าหมด
                                            </p>
                                        )}
                                    </div>


                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        disabled={item.p_quantity <= 0}
                                        style={{
                                            backgroundColor: item.p_quantity > 0 ? "#1677ff" : "#ccc",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 6,
                                            padding: "6px 12px",
                                            cursor: item.p_quantity > 0 ? "pointer" : "not-allowed",
                                            fontWeight: 500,
                                            transition: "background 0.2s ease",
                                        }}
                                    >
                                        🛒 เพิ่มลงตะกร้า
                                    </button>
                                </Card>
                                ))}
                        </div>
                    )}

                </Content>
            </Layout>
        </Layout>
    );
}

export default CustomerHomePage;
