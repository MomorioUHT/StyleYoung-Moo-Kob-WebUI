import { useState, useEffect } from "react";
import api from "../middleware/axios";
import { useNavigate } from "react-router-dom";
import {
    Layout,
    Menu,
    Breadcrumb,
    Avatar,
    Dropdown,
    theme,
    Space,
    Table,
    Modal,
    Spin,
} from "antd";
import {
    HomeOutlined,
    ShoppingOutlined,
    ShoppingCartOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    errorNotification,
} from "../middleware/displayer";

const { Sider, Header, Content } = Layout;

// Layout constants
const SIDER_WIDTH = 205;
const SIDER_COLLAPSED_WIDTH = 80;
const LOGO_HEIGHT = 120;
const LOGO_SIZE = 70;

/**
 * Customer Order Page Component
 * Displays customer's order history with detailed view capability
 * Shows order status, payment details, and delivery tracking
 * 
 * @returns {JSX.Element} The customer order history page
 */
function CustomerOrderPage() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [orders, setOrders] = useState([]);
    const [orderDetails, setOrderDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderDetailmodalOpen, setOrderDetailModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    /**
     * Verifies user authentication token
     * Redirects to login if token is invalid
     */
    const verifyUser = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await api.get("/verifyUser", {
                headers: {
                    "api-key": API_KEY,
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.data.user) {
                navigate("/welcome");
            } else {
                setUserInfo(res.data.user);
            }
        } catch {
            errorNotification("การตรวจสอบสิทธิ์ล้มเหลว", "กรุณาเข้าสู่ระบบอีกครั้ง");
            navigate("/welcome");
        }
    };

    /**
     * Fetches all orders for the current customer
     */
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.post(
                "/customerOrders",
                { customer_id: userInfo?.c_id },
                {
                    headers: {
                        "api-key": API_KEY,
                    },
                }
            );
            setOrders(res.data);
        } catch {
            errorNotification("เกิดข้อผิดพลาด", "ไม่สามารถดึงคำสั่งซื้อได้");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetches detailed information for a specific order
     * 
     * @param {string} order_id - Order ID to fetch details for
     */
    const fetchOrderDetails = async (order_id) => {
        try {
            const res = await api.post(
                "/customerOrderDetails",
                { order_id },
                {
                    headers: {
                        "api-key": API_KEY,
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setOrderDetails(res.data);
        } catch {
            errorNotification("เกิดข้อผิดพลาด", "ไม่สามารถดึงรายละเอียดคำสั่งซื้อได้");
        }
    };

    useEffect(() => {
        verifyUser();
    }, []);

    useEffect(() => {
        if (userInfo) fetchOrders();
    }, [userInfo]);

    const columns = [
        {
            title: "หมายเลขคำสั่งซื้อ",
            dataIndex: "c_order_id",
            render: (text) => (
                <a
                    onClick={() => {
                        setSelectedOrderId(text);
                        fetchOrderDetails(text);
                        setOrderDetailModalOpen(true);
                    }}
                >
                    {text}
                </a>
            ),
        },
        { title: "วันที่สั่งซื้อ", dataIndex: "c_order_date", key: "c_order_date" , 
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
        {
            title: "ยอดรวม (฿)",
            dataIndex: "total_payment",
        },
        {
            title: "สถานะ",
            dataIndex: "c_order_state",
            render: (text) => {
                const colorMap = {
                    pending_payment: "#faad14",
                    wait_for_check: "#1890ff",
                    wait_for_packaging: "#722ed1",
                    pending_delivery: "#f505d1",
                    completed: "#52c41a",
                    cancelled: "#fa541c",
                };
                return (
                    <span style={{ color: colorMap[text] || "#000", fontWeight: 600 }}>
                        {orderStatusMap[text] || text}
                    </span>
                );
            },
        },
        {
            title: "เลขที่อ้างอิงการโอนเงิน",
            dataIndex: "transaction_code",
        },
    ];

    const detailColumns = [
        { title: "รหัสสินค้า", dataIndex: "p_id" },
        { title: "ชื่อสินค้า", dataIndex: "p_name" },
        { title: "จำนวน", dataIndex: "quantity" },
        { title: "ราคารวม (฿)", dataIndex: "sub_total" },
    ];

    const menuItems = [
        { key: "home", icon: <HomeOutlined />, label: "หน้าหลัก" },
        { key: "cart", icon: <ShoppingCartOutlined />, label: "ตะกร้าของฉัน" },
        { key: "orders", icon: <ShoppingOutlined />, label: "คำสั่งซื้อของฉัน" },
    ];

    const userMenuItems = [
        { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
    ];

    const orderStatusMap = {
        pending_payment: "รอชำระเงิน",
        wait_for_check: "รอตรวจสอบคำสั่งซื้อ",
        wait_for_packaging: "รอจัดเตรียมสินค้า",
        pending_delivery: "รอจัดส่ง",
        completed: "เสร็จสิ้น",
        cancelled: "ยกเลิกแล้ว"
    };

    const handleMenuClick = (e) => {
        if (e.key === "logout") {
            localStorage.removeItem("token");
            window.location.reload();
        } else {
            navigate(`/${e.key}`);
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
                            }}
                        />
                    )}
                    <span>{collapsed ? "STY" : "Styleyoung Moo Kob"}</span>
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={["orders"]}
                    items={menuItems}
                    onClick={handleMenuClick}
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

                    <Space>
                        {userInfo && (
                            <span style={{ fontWeight: 500 }}>
                                {userInfo.c_firstname} {userInfo.c_lastname} ({userInfo.c_username})
                            </span>
                        )}
                        <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }}>
                            <Avatar
                                style={{ backgroundColor: "#1677ff", cursor: "pointer" }}
                                icon={<UserOutlined />}
                            />
                        </Dropdown>
                    </Space>
                </Header>

                <Content
                    style={{
                        margin: "16px",
                        padding: 24,
                        background: colorBgContainer,
                        borderRadius: 8,
                    }}
                >
                    <Breadcrumb style={{ marginBottom: 16 }}>
                        <Breadcrumb.Item>หน้าหลัก</Breadcrumb.Item>
                        <Breadcrumb.Item>คำสั่งซื้อของฉัน</Breadcrumb.Item>
                    </Breadcrumb>

                    {loading ? (
                        <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
                    ) : (
                        <Table
                            dataSource={orders}
                            columns={columns}
                            rowKey="c_order_id"
                            pagination={false}
                        />
                    )}

                    <Modal
                        title={`รายละเอียดคำสั่งซื้อ ${selectedOrderId}`}
                        open={orderDetailmodalOpen}
                        onCancel={() => setOrderDetailModalOpen(false)}
                        footer={null}
                        width={700}
                    >
                        <Table
                            dataSource={orderDetails}
                            columns={detailColumns}
                            rowKey="order_detail_id"
                            pagination={false}
                        />
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
}

export default CustomerOrderPage;
