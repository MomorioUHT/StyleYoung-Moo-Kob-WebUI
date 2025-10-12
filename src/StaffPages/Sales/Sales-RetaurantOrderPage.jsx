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

function SalesRestaurantOrderPage() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const fetchRestaurantOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get(
                "allRestaurantOrders",
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

    const confirmOrder = async (resturant_name, restaurant_id, order_id, quantity, p_id) => {
        Modal.confirm({
            title: "ยืนยันการชำระเงินของร้านอาหาร",
            content: (
                <>
                    <p>คุณแน่ใจหรือไม่ว่าร้านอาหาร {resturant_name} ชำระเงินแล้ว</p>
                    <p>⚠️ การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                </>
            ),
            okText: "ยืนยัน",
            cancelText: "ยกเลิก",
            onOk: async () => {
                try {
                    await api.post(
                        "/confirmTransactionsRestaurant",
                        {
                            "restaurant_id": restaurant_id,
                            "restaurant_order_id": order_id,
                            "order_quantity": quantity,
                            "product_id": p_id,
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
                    fetchRestaurantOrders();
                } catch (err) {
                    console.error(err);
                    errorNotification("เกิดข้อผิดพลาด", "ไม่สามารถยืนยันคำสั่งซื้อได้");
                }
            },
        });
    };

    const rejectOrder = async (resturant_name, restaurant_id, order_id) => {
        Modal.confirm({
            title: "ยืนยันการปฏิเสธคำสั่งซื้อ?",
            content: (
                <>
                    <p>คุณแน่ใจหรือไม่ว่าร้านอาหาร {resturant_name} ไม่ชำระเงิน?</p>
                    <p>⚠️ การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                </>
            ),
            okText: "ยืนยัน",
            cancelText: "ยกเลิก",
            okType: "danger",
            onOk: async () => {
                try {
                    await api.post(
                        "/cancelTransactionsRestaurant",
                        { restaurant_id: restaurant_id, restaurant_order_id: order_id },
                        {
                            headers: {
                                "api-key": API_KEY,
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        }
                    );
                    successNotification("คำสั่งซื้อถูกยกเลิกแล้ว", `คำสั่งซื้อ #${order_id} ถูกปฏิเสธ`);
                    fetchRestaurantOrders();
                } catch {
                    errorNotification("เกิดข้อผิดพลาด", "ไม่สามารถยกเลิกคำสั่งซื้อได้");
                }
            },
        });
    };

    const filteredOrders = filterStatus
    ? orders.filter((o) => o.r_order_state === filterStatus)
    : orders;

    useEffect(() => {
        verifyUser();
        fetchRestaurantOrders();
    }, []);

    const columns = [
        {
            title: "หมายเลขคำสั่งซื้อ",
            dataIndex: "r_order_id",
        },
        {
            title: "ชื่อร้านอาหาร",
            dataIndex: "r_name",
            key: "r_name" , 
        },
        { title: "วันที่สั่งซื้อ", dataIndex: "r_order_date", key: "r_order_date" , 
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
            title: "สินค้าที่สั่ง",
            dataIndex: "p_name",
        },
        {
            title: "จำนวนที่สั่ง (หน่วย)",
            dataIndex: "quantity",
        },
        {
            title: "ยอดรวม (฿)",
            dataIndex: "r_total_payment",
        },
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
                if (record.r_order_state !== "wait_for_check") return "---";

                return (
                    <Space>
                        <button
                            onClick={() => confirmOrder(record.r_name, record.r_id, record.r_order_id, record.quantity, record.p_id)}
                            style={{
                                background: "#52c41a",
                                border: "none",
                                color: "#fff",
                                padding: "6px 12px",
                                borderRadius: 6,
                                cursor: "pointer",
                            }}
                        >
                            ร้านอาหารชำระเงินแล้ว
                        </button>

                        <button
                            onClick={() => rejectOrder(record.r_name, record.r_id, record.r_order_id)}
                            style={{
                                background: "#f5222d",
                                border: "none",
                                color: "#fff",
                                padding: "6px 12px",
                                borderRadius: 6,
                                cursor: "pointer",
                            }}
                        >
                            ร้านอาหารไม่ชำระเงิน
                        </button>
                    </Space>
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
                    defaultSelectedKeys={["restaurant-orders"]}
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
                        <Breadcrumb.Item>คำสั่งซื้อจากร้านอาหาร</Breadcrumb.Item>
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
                </Content>
            </Layout>
        </Layout>
    );
}

export default SalesRestaurantOrderPage;
