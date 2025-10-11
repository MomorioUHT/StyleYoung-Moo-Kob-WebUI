import { useState, useEffect } from "react";
import api from "../../middleware/axios";
import { useNavigate } from "react-router-dom";
import { 
    errorNotification
} from "../../middleware/displayer";

import { Layout, Menu, Breadcrumb, Avatar, Dropdown, theme, Space, Row, Col, Card, Table } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    DashboardOutlined,
    TeamOutlined,
    HomeOutlined,
    ClusterOutlined,
    LogoutOutlined,
    TruckOutlined,
    ReadOutlined,
    ShoppingCartOutlined,
    ProductOutlined,
} from "@ant-design/icons";

import {
    LineChart, Line, XAxis, YAxis, Tooltip
} from "recharts";

const { Header, Sider, Content } = Layout;

function AdminDashboard() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    // Dashboard data states
    const [summary, setSummary] = useState({
        customers: 0,
        staffs: 0,
        restaurants: 0,
        supplyLogs: 0,
    });

    const [monthlySupply, setMonthlySupply] = useState([]);
    const [recentStaffs, setRecentStaffs] = useState([]);
    const [recentCustomers, setRecentCustomers] = useState([]);

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    // ตรวจสอบสิทธิ์ผู้ใช้
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
                navigate("/welcome");
            } else {
                setUserInfo(res.data.user);
                fetchDashboardData();
            }
        } catch {
            errorNotification("การตรวจสอบสิทธิ์ล้มเหลว", "กรุณาเข้าสู่ระบบอีกครั้ง");
            navigate("/welcome");
        }
    };

    useEffect(() => {
        verifyUser();
        fetchDashboardData()
    }, []);

    // Dashboard Items
    const fetchDashboardData = async () => {
        const token = localStorage.getItem("token");
        try {
            const [c, s, r, sup] = await Promise.all([
                api.get("/customers", {
                headers: {
                    'api-key': API_KEY,
                    Authorization: `Bearer ${token}` 
                },
            }).catch(() => ({ data: [] })),
                api.get("/staffs", {
                headers: {
                    'api-key': API_KEY,
                    Authorization: `Bearer ${token}` 
                },
            }).catch(() => ({ data: [] })),
                api.get("/restaurants", {
                headers: {
                    'api-key': API_KEY,
                    Authorization: `Bearer ${token}` 
                },
            }).catch(() => ({ data: [] })),
                api.get("/supplyLogs", {
                headers: {
                    'api-key': API_KEY,
                    Authorization: `Bearer ${token}` 
                },
            }).catch(() => ({ data: [] })),
            ]);

            setSummary({
                customers: c.data.length,
                staffs: s.data.length,
                restaurants: r.data.length,
                supplyLogs: sup.data.length,
            });

            console.log("Customers:", c.data);
            console.log("Staffs:", s.data);
            console.log("Restaurants:", r.data);
            console.log("SupplyLogs:", sup.data);

            const grouped = {};
            sup.data.forEach(log => {
                const month = new Date(log.sup_date).toLocaleString("th-TH", { month: "short" });
                grouped[month] = (grouped[month] || 0) + log.sup_quantity;
            });
            const monthly = Object.keys(grouped).map(m => ({ month: m, totalQuantity: grouped[m] }));
            setMonthlySupply(monthly);

            setRecentStaffs(s.data.sort((a,b)=>new Date(b.s_lastlogin)-new Date(a.s_lastlogin)).slice(0,5));
            setRecentCustomers(c.data.sort((a,b)=>new Date(b.c_lastlogin)-new Date(a.c_lastlogin)).slice(0,5));
        } catch (err) {
            console.error(err);
        }
    };

    const handleMenuClick = (e) => {
        if (e.key === "logout") {
            localStorage.removeItem("token");
            window.location.reload();
        } else {
            navigate(`/administrator/${e.key}`);
        }
    };

    const menuItems = [
        { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
        { key: "staffs", icon: <TeamOutlined />, label: "จัดการข้อมูลพนักงาน" },
        { key: "products", icon: <ShoppingCartOutlined />, label: "จัดการข้อมูลสินค้า"},
        { key: "suppliers", icon: <TruckOutlined />, label: "จัดการข้อมูลผู้จำหน่าย"},
        { key: "restaurants", icon: <HomeOutlined />, label: "จัดการข้อมูลร้านอาหาร"},
        { key: "ingredients", icon: <ProductOutlined />, label: "จัดการข้อมูลวัตถุดิบ"},
        { key: "recipes", icon: <ReadOutlined />, label: "จัดการข้อมูลสูตรอาหาร"},
        { key: "customers", icon: <ClusterOutlined />, label: "ข้อมูลลูกค้า" },
    ];

    const userMenuItems = [
        { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
    ];

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
                    <span>{collapsed ? "Admin" : "Admin Panel"}</span>
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={["dashboard"]}
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
                                {userInfo.s_firstname} {userInfo.s_lastname} ({userInfo.s_username})
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
                        <Breadcrumb.Item>Admin</Breadcrumb.Item>
                        <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Dashboard Section */}
                    <Row gutter={16}>
                        <Col span={6}><Card title="ลูกค้าทั้งหมด 👥">{summary.customers}</Card></Col>
                        <Col span={6}><Card title="พนักงาน 👨‍💼">{summary.staffs}</Card></Col>
                        <Col span={6}><Card title="ร้านอาหาร 🍽">{summary.restaurants}</Card></Col>
                        <Col span={6}><Card title="รายการสั่งวัตถุดิบ 📦">{summary.supplyLogs}</Card></Col>
                    </Row>

                    <Row gutter={16} style={{ marginTop: 20 }}>
                        <Col span={12}>
                            <Card title="ปริมาณวัตถุดิบที่สั่งรายเดือน">
                                <LineChart width={400} height={250} data={monthlySupply}>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="totalQuantity" stroke="#8884d8" />
                                </LineChart>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card title="พนักงานที่เข้าใช้งานล่าสุด">
                                <Table
                                    size="small"
                                    pagination={false}
                                    dataSource={recentStaffs}
                                    columns={[
                                        { title: "ชื่อ", dataIndex: "s_firstname" },
                                        { title: "ตำแหน่ง", dataIndex: "s_position" },
                                        { title: "เข้าใช้งานล่าสุด", dataIndex: "s_lastlogin", 
                                            render: (text) => {
                                            if (!text) return "-";
                                            const date = new Date(text);
                                            return new Intl.DateTimeFormat('th-TH', { 
                                                day: '2-digit', 
                                                month: 'short', 
                                                year: 'numeric', 
                                                hour: '2-digit', 
                                                minute: '2-digit',
                                                hour12: false,
                                            }).format(date);
                                        }}
                                    ]}
                                    rowKey="s_id"
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={16} style={{ marginTop: 20 }}>
                        <Col span={24}>
                            <Card title="ลูกค้าใหม่ล่าสุด">
                                <Table
                                    size="small"
                                    pagination={false}
                                    dataSource={recentCustomers}
                                    columns={[
                                        { title: "ชื่อ", dataIndex: "c_firstname" },
                                        { title: "ชื่อผู้ใช้", dataIndex: "c_username" },
                                        { title: "เข้าใช้งานล่าสุด", dataIndex: "c_lastlogin", dataIndex: "s_lastlogin", 
                                            render: (text) => {
                                            if (!text) return "-";
                                            const date = new Date(text);
                                            return new Intl.DateTimeFormat('th-TH', { 
                                                day: '2-digit', 
                                                month: 'short', 
                                                year: 'numeric', 
                                                hour: '2-digit', 
                                                minute: '2-digit',
                                                hour12: false,
                                            }).format(date);
                                        }},
                                    ]}
                                    rowKey="c_id"
                                />
                            </Card>
                        </Col>
                    </Row>
                </Content>
            </Layout>
        </Layout>
    );
}

export default AdminDashboard;
