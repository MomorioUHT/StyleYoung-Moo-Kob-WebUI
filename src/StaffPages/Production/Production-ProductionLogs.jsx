import { useState, useEffect } from "react";
import api from "../../middleware/axios";
import { useNavigate } from "react-router-dom";
import { 
    errorNotification,
} from "../../middleware/displayer";

import { Layout, Menu, Breadcrumb, Avatar, Dropdown, theme, Space, Input, Table } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    DashboardOutlined,
    LogoutOutlined,
    ReadOutlined,
    UnorderedListOutlined
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

// Layout constants
const SIDER_WIDTH = 250;

/**
 * Production Logs Component
 * Displays history of all production activities
 * Shows product, quantity, date, and staff information
 * 
 * @returns {JSX.Element} The production logs view with search functionality
 */
function ProductionProductionLogs() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const [logsSearchText, setLogsSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [productionLogs, setProductionLogs] = useState([]);

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    // ProductionLogs Columns
    const productionLogsColumns = [
        { title: "ID", dataIndex: "prod_id", key: "prod_id" },
        { title: "ชื่อสินค้าที่ผลิต", dataIndex: "p_name", key: "p_name" },
        { title: "จำนวนที่ผลิต (หน่วย)", dataIndex: "prod_quantity", key: "prod_quantity" },
        { title: "วันที่ผลิต", dataIndex: "prod_date", key: "prod_date" , 
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

    const menuItems = [
        { key: "dashboard", icon: <DashboardOutlined />, label: "หน้าหลัก" },
        { key: "prodlogs", icon: <UnorderedListOutlined />, label: "ประวัติการผลิต"}
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

    const fetchProductionLogs = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await api.get("/productionLogs", {
                headers: {
                    "api-key": API_KEY,
                    Authorization: `Bearer ${token}`,
                },
            });
            setProductionLogs(res.data);
        } catch (err) {
            errorNotification("โหลดข้อมูล logs การผลิตสินค้าล้มเหลว", "กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }       
    }

    useEffect(() => {
        verifyUser();
        fetchProductionLogs();
    }, []);

    const handleMenuClick = (e) => {
        if (e.key === "logout") {
            localStorage.removeItem("token");
            window.location.reload();
        } else {
            navigate(`/production/${e.key}`);
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
                    <span>{collapsed ? "Production" : "Production Panel"}</span>
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={["prodlogs"]}
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
                        <Breadcrumb.Item>Production</Breadcrumb.Item>
                        <Breadcrumb.Item>ประวัติการผลิต</Breadcrumb.Item>
                    </Breadcrumb>

                    <h2>
                        <UnorderedListOutlined /> ข้อมูลประวัติการผลิต
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
                        columns={productionLogsColumns}
                        dataSource={productionLogs.filter((item) => {
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

export default ProductionProductionLogs;
