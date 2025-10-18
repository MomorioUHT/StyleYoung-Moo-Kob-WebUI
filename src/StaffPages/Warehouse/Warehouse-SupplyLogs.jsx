import { useState, useEffect } from "react";
import api from "../../middleware/axios";
import { useNavigate } from "react-router-dom";
import { 
    errorNotification,
} from "../../middleware/displayer";

import { Layout, Menu, Breadcrumb, Avatar, Dropdown, theme, Space, Table, Input } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    DashboardOutlined,
    LogoutOutlined,
    RedoOutlined,
    ProductOutlined
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

// Layout constants
const SIDER_WIDTH = 250;

/**
 * Warehouse Supply Logs Component
 * Displays history of all supply/receiving activities
 * Shows ingredients, quantities, suppliers, and dates
 * 
 * @returns {JSX.Element} The supply logs view with ingredient tracking
 */
function WarehouseSupplylogs() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const [loading, setLoading] = useState(false);
    const [logsSearchText, setLogsSearchText] = useState("");
    const [ingredientsSearchText, setIngredientsSearchText] = useState("");

    const [supplyLogs, setSupplyLogs] = useState([]);
    const [ingredients, setIngredients] = useState([]);

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const menuItems = [
        { key: "dashboard", icon: <DashboardOutlined />, label: "หน้าหลัก" },
        { key: "supplylogs", icon: <RedoOutlined />, label: "ประวัติการรับวัตถุดิบ" }
    ];

    // Supply logs columns
    const supplyLogsColumns = [
        { title: "ID", dataIndex: "supply_id", key: "supply_id" },
        { title: "ชื่อผู้จำหน่าย", dataIndex: "sup_name", key: "sup_name" },
        { title: "วัตถุดิบที่นำเข้า", dataIndex: "i_name", key: "i_name" },
        { title: "จำนวนที่รับเข้า (หน่วย)", dataIndex: "sup_quantity", key: "sup_quantity" },
        { title: "วันที่รับสินค้า", dataIndex: "sup_date", key: "sup_date" , 
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
    ];

    // Ingredient Table
    const ingredientsColumns = [
        { title: "ID", dataIndex: "i_id", key: "i_id" },
        { title: "ชื่อวัตถุดิบ", dataIndex: "i_name", key: "i_name" },
        { title: "ปริมาณที่มี (หน่วย)", dataIndex: "i_amount", key: "i_amount" }
    ];

    // ตรวจสอบสิทธิ์ผู้ใช้
    const verifyUser = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await api.get("/verifyUser", {
                headers: {
                    "api-key": API_KEY,
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.data.user.s_position) navigate("/welcome");
            else setUserInfo(res.data.user);
        } catch {
            errorNotification("การตรวจสอบสิทธิ์ล้มเหลว", "กรุณาเข้าสู่ระบบอีกครั้ง");
            navigate("/welcome");
        }
    };

    // Fetch Ingredients
    const fetchIngredients = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await api.get("/ingredients", {
                headers: {
                    'api-key': API_KEY,
                    Authorization: `Bearer ${token}`
                },
            });
            setIngredients(res.data);
        } catch (err) {
            errorNotification("โหลดข้อมูลวัตถุดิบล้มเหลว", "กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }
    };

    // Fetch Supply logs 
    const fetchSupplyLogs = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await api.get("/supplyLogs", {
                headers: {
                    "api-key": API_KEY,
                    Authorization: `Bearer ${token}`,
                },
            });
            setSupplyLogs(res.data);
        } catch (err) {
            errorNotification("โหลดข้อมูล logs การรับสินค้าล้มเหลว", "กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }       
    }

    useEffect(() => {
        verifyUser();
        fetchSupplyLogs();
        fetchIngredients();
    }, []);

    const handleMenuClick = (e) => {
        if (e.key === "logout") {
            localStorage.removeItem("token");
            window.location.reload();
        } else {
            navigate(`/warehouse/${e.key}`);
        }
    };

    const userMenuItems = [{ key: "logout", icon: <LogoutOutlined />, label: "Logout" }];

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
                    }}
                >
                    {!collapsed && (
                        <img
                            src="/Logo.png"
                            alt="Logo2"
                            style={{ width: 70, height: 70, objectFit: "contain", marginBottom: 8 }}
                        />
                    )}
                    <span>{collapsed ? "Warehouse" : "Warehouse Panel"}</span>
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={["supplylogs"]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{ background: "#001529" }}
                />
            </Sider>

            <Layout
                style={{
                    marginLeft: collapsed ? 80 : 200,
                    transition: "all 0.2s",
                    height: "100vh",
                }}
            >
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
                        <Breadcrumb.Item>Warehouse</Breadcrumb.Item>
                        <Breadcrumb.Item>ประวัติการรับวัตถุดิบเข้าคลัง</Breadcrumb.Item>
                    </Breadcrumb>

                    <h2>
                        <ProductOutlined /> ข้อมูลวัตถุดิบในคลัง
                    </h2>

                    <Input.Search
                        placeholder="ค้นหาวัตถุดิบในคลัง"
                        allowClear
                        enterButton="ค้นหา"
                        size="middle"
                        style={{ maxWidth: 350, marginBottom: 20 }}
                        onSearch={(value) => setIngredientsSearchText(value)}
                        onChange={(e) => setIngredientsSearchText(e.target.value)}
                    />

                    <Table
                        columns={ingredientsColumns}
                        dataSource={ingredients.filter((item) => {
                            if (!ingredientsSearchText) return true;
                            const lower = ingredientsSearchText.toLowerCase();
                            return Object.values(item).some((val) =>
                                String(val).toLowerCase().includes(lower)
                            );
                        })}
                        rowKey="i_id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />

                    <h2>
                        <RedoOutlined /> ประวัติการรับวัตถุดิบเข้าคลัง
                    </h2>

                    <Input.Search
                        placeholder="ค้นหา log"
                        allowClear
                        enterButton="ค้นหา"
                        size="middle"
                        style={{ maxWidth: 350, marginBottom: 20 }}
                        onSearch={(value) => setLogsSearchText(value)}
                        onChange={(e) => setLogsSearchText(e.target.value)}
                    />
                    
                    <Table
                        columns={supplyLogsColumns}
                        dataSource={supplyLogs.filter((item) => {
                            if (!logsSearchText) return true;
                            const lower = logsSearchText.toLowerCase();
                            return Object.values(item).some((val) =>
                                String(val).toLowerCase().includes(lower)
                            );
                        })}
                        rowKey="sup_name"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />

                </Content>
            </Layout>
        </Layout>
    );
}

export default WarehouseSupplylogs;
