import { useState, useEffect } from "react";
import api from "../../middleware/axios";
import { useNavigate } from "react-router-dom";
import {
    Layout, Menu, Breadcrumb, Avatar, Dropdown, theme,
    Space, Table, Modal, Spin, Select
} from "antd";
import {
    HomeOutlined, UnorderedListOutlined, LogoutOutlined,
    MenuUnfoldOutlined, MenuFoldOutlined, UserOutlined, TruckOutlined
} from "@ant-design/icons";
import {
    errorNotification, successNotification
} from "../../middleware/displayer";

const { Sider, Header, Content } = Layout;
const { Option } = Select;

function SalesDeliveryPage() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [restaurantOrders, setRestaurantOrders] = useState([]);
    const [customerOrders, setCustomerOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("");

    const [orderDetails, setOrderDetails] = useState([]);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false);

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    // ✅ ตรวจสอบสิทธิ์ผู้ใช้
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

    // ✅ ดึงข้อมูลคำสั่งซื้อร้านอาหาร
    const fetchPendingRestaurant = async () => {
        try {
            const res = await api.get("restaurantOrdersPendingDelivery", {
                headers: { "api-key": API_KEY },
            });
            setRestaurantOrders(res.data);
        } catch {
            errorNotification("เกิดข้อผิดพลาด", "ไม่สามารถดึงคำสั่งซื้อร้านอาหารได้");
        }
    };

    // ✅ ดึงข้อมูลคำสั่งซื้อลูกค้า
    const fetchPendingCustomer = async () => {
        try {
            const res = await api.get("customerOrdersPendingDelivery", {
                headers: { "api-key": API_KEY },
            });
            setCustomerOrders(res.data);
        } catch {
            errorNotification("เกิดข้อผิดพลาด", "ไม่สามารถดึงคำสั่งซื้อลูกค้าได้");
        }
    };

    // ✅ ปุ่ม "จัดส่งของแล้ว"
    const markAsDelivered = async (orderId, isRestaurant = false) => {
        Modal.confirm({
            title: "ยืนยันการจัดส่งของแล้ว?",
            content: (
                <>
                    <p>คุณแน่ใจหรือไม่ว่าคำสั่งซื้อ #{orderId} จัดส่งแล้ว?</p>
                    <p>⚠️ การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                </>
            ),
            okText: "ยืนยัน",
            cancelText: "ยกเลิก",
            onOk: async () => {
                try {
                    const url = isRestaurant
                        ? "/markRestaurantDelivered"
                        : "/markCustomerDelivered";

                    await api.post(
                        url,
                        { order_id: orderId },
                        {
                            headers: {
                                "api-key": API_KEY,
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        }
                    );

                    successNotification("จัดส่งสำเร็จ", `คำสั่งซื้อ #${orderId} ถูกจัดส่งแล้ว`);
                    if (isRestaurant) fetchPendingRestaurant();
                    else fetchPendingCustomer();
                } catch {
                    errorNotification("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตสถานะได้");
                }
            },
        });
    };

    useEffect(() => {
        (async () => {
            setLoading(true);
            await verifyUser();
            await Promise.all([fetchPendingRestaurant(), fetchPendingCustomer()]);
            setLoading(false);
        })();
    }, []);

    const orderStatusMap = {
        pending_payment: "รอชำระเงิน",
        wait_for_check: "รอตรวจสอบ",
        wait_for_packaging: "รอจัดเตรียมสินค้า",
        pending_delivery: "รอจัดส่ง",
        completed: "เสร็จสิ้น",
        cancelled: "ยกเลิกแล้ว"
    };

    const filteredRestaurantOrders = filterStatus
        ? restaurantOrders.filter((o) => o.r_order_state === filterStatus)
        : restaurantOrders;

    const filteredCustomerOrders = filterStatus
        ? customerOrders.filter((o) => o.c_order_state === filterStatus)
        : customerOrders;

    // ✅ ตารางร้านอาหาร
    const restaurantColumns = [
        { title: "หมายเลขคำสั่งซื้อ", dataIndex: "r_order_id" },
        { title: "ชื่อร้านอาหาร", dataIndex: "r_name" },
        { title: "ที่อยู่จัดส่ง", dataIndex: "r_address" },
        { title: "สินค้าที่สั่ง", dataIndex: "p_name" },
        { title: "จำนวน (หน่วย)", dataIndex: "quantity" },
        { title: "ยอดรวม (฿)", dataIndex: "r_total_payment" },
        {
            title: "สถานะ",
            dataIndex: "r_order_state",
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
            title: "การดำเนินการ",
            key: "actions",
            render: (_, record) => {
                if (record.r_order_state === "completed") return "---";
                return (
                    <button
                        onClick={() => markAsDelivered(record.r_order_id, true)}
                        style={{
                            background: "#1890ff",
                            border: "none",
                            color: "#fff",
                            padding: "6px 12px",
                            borderRadius: 6,
                            cursor: "pointer",
                        }}
                    >
                        จัดส่งของแล้ว
                    </button>
                );
            },
        },
    ];

    // ✅ ตารางลูกค้า
    const customerColumns = [
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
        { title: "ชื่อ", dataIndex: "c_firstname", key: "c_firstname" },
        { title: "นามสกุล", dataIndex: "c_lastname", key: "c_lastname" },
        { title: "ที่อยู่จัดส่ง", dataIndex: "c_address" },
        { title: "ยอดรวม (฿)", dataIndex: "total_payment" },
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
            title: "การดำเนินการ",
            key: "actions",
            render: (_, record) => {
                if (record.c_order_state === "completed") return "---";
                return (
                    <button
                        onClick={() => markAsDelivered(record.c_order_id, false)}
                        style={{
                            background: "#1890ff",
                            border: "none",
                            color: "#fff",
                            padding: "6px 12px",
                            borderRadius: 6,
                            cursor: "pointer",
                        }}
                    >
                        จัดส่งของแล้ว
                    </button>
                );
            },
        },
    ];

    const menuItems = [
        { key: "dashboard", icon: <HomeOutlined />, label: "หน้าหลัก" },
        { key: "customer-orders", icon: <UnorderedListOutlined />, label: "คำสั่งซื้อจากลูกค้า"},
        { key: "restaurant-orders", icon: <UnorderedListOutlined />, label: "คำสั่งซื้อจากร้านอาหาร"},
        { key: "delivery", icon: <TruckOutlined />, label: "จัดการการส่งของ"}
    ];

    const userMenuItems = [
        { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
    ];

    const handleMenuClick = (e) => {
        if (e.key === "logout") {
            localStorage.removeItem("token");
            window.location.reload();
        } else {
            navigate(`/sales/${e.key}`);
        }
    };

    return (
        <Layout style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
            {/* ✅ Sidebar */}
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
                            alt="Logo"
                            style={{
                                width: 70,
                                height: 70,
                                objectFit: "contain",
                                marginBottom: 8,
                            }}
                        />
                    )}
                    <span>{collapsed ? "Sales" : "Sales Panel"}</span>
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={["delivery"]}
                    items={menuItems}
                    onClick={handleMenuClick}
                />
            </Sider>

            {/* ✅ Main Layout */}
            <Layout
                style={{
                    marginLeft: collapsed ? 80 : 200,
                    transition: "all 0.2s",
                    height: "100vh",
                }}
            >
                {/* ✅ Header */}
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
                                {userInfo.s_firstname} {userInfo.s_lastname} ({userInfo.s_username})
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

                {/* ✅ Content */}
                <Content
                    style={{
                        margin: "16px",
                        padding: 24,
                        background: colorBgContainer,
                        borderRadius: 8,
                        overflowY: "auto",
                    }}
                >
                    <Breadcrumb style={{ marginBottom: 16 }}>
                        <Breadcrumb.Item>Sales</Breadcrumb.Item>
                        <Breadcrumb.Item>จัดการการส่งของ</Breadcrumb.Item>
                    </Breadcrumb>

                    <Space style={{ marginBottom: 16 }}>
                        <span>กรองตามสถานะ:</span>
                        <Select
                            style={{ width: 200 }}
                            placeholder="เลือกสถานะ"
                            value={filterStatus}
                            onChange={(value) => setFilterStatus(value)}
                            allowClear
                        >
                            {Object.entries(orderStatusMap).map(([key, label]) => (
                                <Option key={key} value={key}>
                                    {label}
                                </Option>
                            ))}
                        </Select>
                    </Space>

                    <h3>📦 คำสั่งซื้อจากลูกค้า</h3>
                    {loading ? (
                        <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
                    ) : (
                        <Table
                            dataSource={filteredCustomerOrders}
                            columns={customerColumns}
                            rowKey="c_order_id"
                            pagination={false}
                            style={{ marginBottom: 40 }}
                        />
                    )}

                    <h3>🏪 คำสั่งซื้อจากร้านอาหาร</h3>
                    {loading ? (
                        <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
                    ) : (
                        <Table
                            dataSource={filteredRestaurantOrders}
                            columns={restaurantColumns}
                            rowKey="r_order_id"
                            pagination={false}
                        />
                    )}
                </Content>
                <Modal
                    title={`รายละเอียดคำสั่งซื้อ ${selectedOrderId}`}
                    open={orderDetailModalOpen}
                    onCancel={() => setOrderDetailModalOpen(false)}
                    footer={null}
                    width={700}
                >
                    <Table
                        dataSource={orderDetails}
                        columns={[
                            { title: "รหัสสินค้า", dataIndex: "p_id" },
                            { title: "ชื่อสินค้า", dataIndex: "p_name" },
                            { title: "จำนวน", dataIndex: "quantity" },
                            { title: "ราคารวม (฿)", dataIndex: "sub_total" },
                        ]}
                        rowKey="order_detail_id"
                        pagination={false}
                    />
                </Modal>
            </Layout>
        </Layout>
    );
}

export default SalesDeliveryPage;
