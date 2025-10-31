import { useState, useEffect } from "react";
import api from "../../middleware/axios";
import { useNavigate } from "react-router-dom";
import { 
    errorNotification,
} from "../../middleware/displayer";

import { 
    Layout, Menu, Breadcrumb, Avatar, Dropdown, theme, Space, Input, Table 
} from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    DashboardOutlined,
    LogoutOutlined,
    UnorderedListOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

// Layout constants
const SIDER_WIDTH = 250;

/**
 * QC Logs Component
 * Displays history of quality control activities
 * Shows grading results, quantities, and staff information
 * 
 * @returns {JSX.Element} The QC logs view with search and filtering
 */
function QCQCLogs() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const [QCLogs, setQCLogs] = useState([]);

    const [logsSearchText, setLogsSearchText] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        token: { colorBgContainer },
    } = theme.useToken();

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

    const fetchQCLogs = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await api.get("/qcLogs", {
                headers: {
                    "api-key": API_KEY,
                    Authorization: `Bearer ${token}`,
                },
            });
            setQCLogs(res.data);
        } catch (err) {
            errorNotification("โหลดข้อมูล logs การ QC ล้มเหลว", "กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }       
    }

    useEffect(() => {
        verifyUser();
        fetchQCLogs();
    }, []);

    const handleMenuClick = (e) => {
        if (e.key === "logout") {
            localStorage.removeItem("token");
            window.location.reload();
        } else {
            navigate(`/qc/${e.key}`);
        }
    };

    const userMenuItems = [{ key: "logout", icon: <LogoutOutlined />, label: "Logout" }];

    const QCLogsColumns = [
        { title: "ID", dataIndex: "qc_id", key: "qc_id" },
        { title: "ชื่อสินค้าก่อนที่จะถูก QC", dataIndex: "p_name", key: "p_name" },
        { title: "สถานะการ QC", dataIndex: "qc_state", key: "qc_state",
            render: (text) => {
                if (text === "to_be_added") {
                    return "กำลังรอการเพิ่มเข้าคลัง"
                } else if (text === "added") {
                    return "ถูกเพิ่มเข้าคลังแล้ว"
                }
            }
        },
        { title: "เกรดที่ถูก QC", dataIndex: "qc_grade", key: "qc_grade"},
        {
            title: "พนักงานที่ QC",
            key: "staff_name",
            render: (_, record) => `${record.s_firstname} ${record.s_lastname}`,
        },
        { title: "จำนวนหน่วยที่ QC", dataIndex: "qc_quantity", key: "qc_quantity" },
        { title: "วันที่ตรวจสอบ", dataIndex: "qc_date", key: "qc_date" , 
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
                    <span>{collapsed ? "QC" : "QC Panel"}</span>
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={["qclogs"]}
                    items={[
                        { key: "dashboard", icon: <DashboardOutlined />, label: "หน้าหลัก" },
                        { key: "qclogs", icon: <UnorderedListOutlined />, label: "ประวัติการ QC" }
                    ]}
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
                        <Breadcrumb.Item>QC</Breadcrumb.Item>
                        <Breadcrumb.Item>ประวัติการตรวจสอบคุณภาพสินค้า</Breadcrumb.Item>
                    </Breadcrumb>

                    <h2>
                        <UnorderedListOutlined /> ประวัติการตรวจสอบคุณภาพสินค้า (QC)
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
                        columns={QCLogsColumns}
                        dataSource={QCLogs.filter((item) => {
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

export default QCQCLogs;
