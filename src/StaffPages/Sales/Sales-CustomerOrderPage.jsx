import { useState, useEffect } from "react";
import api from "../../middleware/axios";
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
    Select
} from "antd";
import {
    HomeOutlined,
    UnorderedListOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    TruckOutlined
} from "@ant-design/icons";
import {
    errorNotification,
    successNotification
} from "../../middleware/displayer";

const { Sider, Header, Content } = Layout;
const { Option } = Select;

// Layout constants
const SIDER_WIDTH = 250;

/**
 * Sales Customer Order Page Component
 * Manages customer orders with packaging and transaction confirmation
 * Allows sales staff to process customer orders through workflow stages
 * 
 * @returns {JSX.Element} The customer order management interface
 */
function SalesCustomerOrderPage() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [orders, setOrders] = useState([]);
    const [orderDetails, setOrderDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderDetailmodalOpen, setOrderDetailModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [filterStatus, setFilterStatus] = useState("");

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

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get(
                "allCustomerOrders",
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

    const confirmOrder = async (customer_id, order_id) => {
        Modal.confirm({
            title: "ยืนยันการชำระเงินของลูกค้า",
            content: (
                <>
                    <p>คุณแน่ใจหรือไม่ว่าลูกค้ารหัส {customer_id} ชำระเงินแล้ว</p>
                    <p>⚠️ การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                </>
            ),
            okText: "ยืนยัน",
            cancelText: "ยกเลิก",
            onOk: async () => {
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

                    const order_detail = res.data.map((item) => ({
                        p_id: item.p_id,
                        p_quantity: item.quantity,
                    }));

                    await api.post(
                        "/confirmTransactions",
                        {
                            customer_id,
                            order_id,
                            order_detail,
                        },
                        {
                            headers: {
                                "api-key": API_KEY,
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        }
                    );

                    successNotification(
                        "คำสั่งซื้อยืนยันแล้ว",
                        `คำสั่งซื้อ #${order_id} ถูกยืนยันการชำระเงิน`
                    );
                    fetchOrders();
                } catch (err) {
                    console.error(err);
                    errorNotification("เกิดข้อผิดพลาด", "ไม่สามารถยืนยันคำสั่งซื้อได้");
                }
            },
        });
    };

    const rejectOrder = async (customer_id, order_id) => {
        Modal.confirm({
            title: "ยืนยันการปฏิเสธคำสั่งซื้อ?",
            content: (
                <>
                    <p>คุณแน่ใจหรือไม่ว่าลูกค้ารหัส {customer_id} ยังไม่ชำระเงิน?</p>
                    <p>⚠️ การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                </>
            ),
            okText: "ยืนยัน",
            cancelText: "ยกเลิก",
            okType: "danger",
            onOk: async () => {
                try {
                    await api.post(
                        "/cancelTransactions",
                        { customer_id: customer_id, order_id: order_id },
                        {
                            headers: {
                                "api-key": API_KEY,
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        }
                    );
                    successNotification("คำสั่งซื้อถูกยกเลิกแล้ว", `คำสั่งซื้อ #${order_id} ถูกปฏิเสธ`);
                    fetchOrders();
                } catch {
                    errorNotification("เกิดข้อผิดพลาด", "ไม่สามารถยกเลิกคำสั่งซื้อได้");
                }
            },
        });
    };

    const filteredOrders = filterStatus
    ? orders.filter((o) => o.c_order_state === filterStatus)
    : orders;

    useEffect(() => {
        verifyUser();
        fetchOrders();
    }, []);

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
        {
            title: "การดำเนินการ",
            key: "actions",
            render: (_, record) => {
                if (record.c_order_state !== "wait_for_check") return "---";

                return (
                    <Space>
                        <button
                            onClick={() => confirmOrder(record.c_id, record.c_order_id)}
                            style={{
                                background: "#52c41a",
                                border: "none",
                                color: "#fff",
                                padding: "6px 12px",
                                borderRadius: 6,
                                cursor: "pointer",
                            }}
                        >
                            ลูกค้าชำระเงินแล้ว
                        </button>

                        <button
                            onClick={() => rejectOrder(record.c_id, record.c_order_id)}
                            style={{
                                background: "#f5222d",
                                border: "none",
                                color: "#fff",
                                padding: "6px 12px",
                                borderRadius: 6,
                                cursor: "pointer",
                            }}
                        >
                            ลูกค้าไม่ชำระเงิน
                        </button>
                    </Space>
                );
            },
        },
    ];

    const detailColumns = [
        { title: "รหัสสินค้า", dataIndex: "p_id" },
        { title: "ชื่อสินค้า", dataIndex: "p_name" },
        { title: "จำนวน", dataIndex: "quantity" },
        { title: "ราคารวม (฿)", dataIndex: "sub_total" },
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

    const orderStatusMap = {
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
            navigate(`/sales/${e.key}`);
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
                    <span>{collapsed ? "Sales" : "Sales Panel"}</span>
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={["customer-orders"]}
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

                <Content
                    style={{
                        margin: "16px",
                        padding: 24,
                        background: colorBgContainer,
                        borderRadius: 8,
                    }}
                >
                    <Breadcrumb style={{ marginBottom: 16 }}>
                        <Breadcrumb.Item>Sales</Breadcrumb.Item>
                        <Breadcrumb.Item>คำสั่งซื้อจากลูกค้า</Breadcrumb.Item>
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

                    {loading ? (
                        <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
                    ) : (
                        <Table
                            dataSource={filteredOrders}
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

export default SalesCustomerOrderPage;
