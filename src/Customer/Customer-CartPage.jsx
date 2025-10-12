import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../middleware/axios";
import {
    Layout,
    Menu,
    Breadcrumb,
    Avatar,
    Dropdown,
    theme,
    Space,
    Table,
    Button,
    Modal,
} from "antd";
import {
    HomeOutlined,
    ShoppingOutlined,
    ShoppingCartOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    MenuFoldOutlined,
} from "@ant-design/icons";
import {
    errorNotification,
    successNotification,
    warningNotification
} from "../middleware/displayer";

const { Sider, Header, Content } = Layout;

function CustomerCartPage() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [cart, setCart] = useState([]);

    const [orderSummaryModalOpen, setOrderSummaryModalOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [checkingOrder, setCheckingOrder] = useState(false);

    const [transactionCode, setTransactionCode] = useState("");

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const loadCart = () => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(storedCart);
    };

    const handleRemoveItem = (id) => {
        const newCart = cart.filter((item) => item.p_id !== id);
        setCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
        successNotification("ลบสินค้า", "ลบสินค้าออกจากตะกร้าแล้ว");
    };

    const handleQuantityChange = (id, newQuantity) => {
        if (newQuantity <= 0) return;
        const newCart = cart.map((item) =>
            item.p_id === id ? { ...item, quantity: newQuantity } : item
        );
        setCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
    };

    const totalPrice = cart.reduce(
        (sum, item) => sum + item.p_price * item.quantity,
        0
    );

    // user verifier
    const verifyUser = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await api.get("/verifyUser", {
                headers: {
                    "api-key": API_KEY,
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.data.user) navigate("/welcome");
            else setUserInfo(res.data.user);
        } catch {
            errorNotification("การตรวจสอบสิทธิ์ล้มเหลว", "กรุณาเข้าสู่ระบบอีกครั้ง");
            navigate("/welcome");
        }
    };

    const menuItems = [
        { key: "home", icon: <HomeOutlined />, label: "หน้าหลัก" },
        { key: "cart", icon: <ShoppingCartOutlined />, label: "ตะกร้าของฉัน" },
        { key: "orders", icon: <ShoppingOutlined />, label: "คำสั่งซื้อของฉัน" },
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

    const handleCheckout = async () => {
        setCheckingOrder(true);
        setOrderSummaryModalOpen(true);

        try {
            const res = await api.get("/productsForSale", {
                headers: {
                    "api-key": API_KEY,
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const productData = res.data;
            const updatedCart = [];

            // ตรวจสอบสินค้าในตะกร้า
            for (let item of cart) {
                const found = productData.find((p) => p.p_id === item.p_id);
                if (!found) {
                    warningNotification("สินค้าไม่พบ", `${item.p_name} ไม่มีในระบบ`);
                    continue;
                }
                if (found.p_quantity < item.quantity) {
                    warningNotification("จำนวนสินค้าไม่พอ", `${item.p_name} มีเพียง ${found.p_quantity} ชิ้น`);
                    continue;
                }
                if (found.p_price !== item.p_price) {
                    warningNotification("ราคามีการเปลี่ยนแปลง", `${item.p_name} ราคาใหม่: ${found.p_price}฿`);
                    item.p_price = found.p_price;
                }
                updatedCart.push(item);
            }

            setCart(updatedCart);
            setCheckingOrder(false);
        } catch (err) {
            errorNotification("เกิดข้อผิดพลาด", "ไม่สามารถตรวจสอบสินค้าได้");
            setCheckingOrder(false);
        }
    };

    const confirmOrder = async () => {
        if (!transactionCode.trim()) {
            warningNotification("กรอกเลขที่อ้างอิง", "กรุณากรอกเลขที่อ้างอิงก่อนยืนยันคำสั่งซื้อ");
            return;
        }

        try {
            const total_payment = totalPrice;

            const orderDetails = cart.map((item) => ({
                p_id: item.p_id,
                quantity: item.quantity,
                sub_total: item.p_price * item.quantity,
            }));

            await api.post(
                "/createCustomerOrder",
                {
                    customer_id: userInfo?.c_id,
                    total_payment,
                    transaction_code: transactionCode,
                    orderDetails,
                },
                {
                    headers: {
                        "api-key": API_KEY,
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            localStorage.removeItem("cart");
            setCart([]);
            setPaymentModalOpen(false);
            setTransactionCode(""); // เคลียร์ค่า
            successNotification("คำสั่งซื้อสำเร็จ", "ระบบได้รับการชำระเงินเรียบร้อยแล้ว");
        } catch (err) {
            errorNotification("เกิดข้อผิดพลาด", "ไม่สามารถสร้างคำสั่งซื้อได้");
        }
    };

    useEffect(() => {
        verifyUser();
        loadCart();
    }, []);

    const columns = [
        {
            title: "รูปภาพ",
            dataIndex: "picture_url",
            key: "picture_url",
            render: (url) => (
                <img
                    src={url}
                    alt="product"
                    style={{ width: 60, height: 60, objectFit: "contain" }}
                />
            ),
        },
        {
            title: "ชื่อสินค้า",
            dataIndex: "p_name",
            key: "p_name",
        },
        {
            title: "ราคา/ชิ้น (฿)",
            dataIndex: "p_price",
            key: "p_price",
            render: (price) => price.toLocaleString(),
        },
        {
            title: "จำนวน",
            dataIndex: "quantity",
            key: "quantity",
            render: (qty, record) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Button
                        size="small"
                        onClick={() => handleQuantityChange(record.p_id, qty - 1)}
                    >
                        -
                    </Button>
                    <span>{qty}</span>
                    <Button
                        size="small"
                        onClick={() => handleQuantityChange(record.p_id, qty + 1)}
                    >
                        +
                    </Button>
                </div>
            ),
        },
        {
            title: "ราคารวม (฿)",
            key: "total",
            render: (_, record) =>
                (record.p_price * record.quantity).toLocaleString(),
        },
        {
            title: "จัดการ",
            key: "actions",
            render: (_, record) => (
                <Button danger onClick={() => handleRemoveItem(record.p_id)}>
                    ลบ
                </Button>
            ),
        },
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
                    defaultSelectedKeys={["cart"]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{
                        background: "#001529",
                        borderRight: "none",
                    }}
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
                    <div
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ cursor: "pointer" }}
                    >
                        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </div>

                    <Space size="middle" style={{ display: "flex", alignItems: "center" }}>
                        {userInfo && (
                            <span style={{ fontWeight: 500, fontSize: 15 }}>
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
                        overflow: "auto",
                        height: "calc(100vh - 64px - 32px)",
                    }}
                >
                    <Breadcrumb style={{ marginBottom: 16 }}>
                        <Breadcrumb.Item>ตะกร้าของฉัน</Breadcrumb.Item>
                    </Breadcrumb>

                    <Table
                        dataSource={cart}
                        columns={columns}
                        rowKey="p_id"
                        pagination={false}
                        locale={{ emptyText: "ไม่มีสินค้าในตะกร้า" }}
                    />

                    {cart.length > 0 && (
                        <div
                            style={{
                                textAlign: "right",
                                marginTop: 24,
                                fontSize: 16,
                                fontWeight: 600,
                            }}
                        >
                            💰 ราคารวมทั้งหมด:{" "}
                            <span style={{ color: "#1677ff" }}>
                                {totalPrice.toLocaleString()} ฿
                            </span>

                            <div style={{ marginTop: 16 }}>
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleCheckout}
                                >
                                    ดำเนินการสั่งซื้อ
                                </Button>
                            </div>
                        </div>
                    )}

                    <Modal
                        title="สรุปรายการสั่งซื้อ"
                        open={orderSummaryModalOpen}
                        onCancel={() => setOrderSummaryModalOpen(false)}
                        footer={[
                            <Button key="cancel" onClick={() => setOrderSummaryModalOpen(false)}>
                                ยกเลิก
                            </Button>,
                            <Button
                                key="pay"
                                type="primary"
                                onClick={() => {
                                    setOrderSummaryModalOpen(false);
                                    setPaymentModalOpen(true);
                                }}
                            >
                                ชำระเงิน
                            </Button>,
                        ]}
                        width={700}
                    >
                        {checkingOrder ? (
                            <p>กำลังตรวจสอบข้อมูลสินค้า...</p>
                        ) : (
                            <>
                                <Table
                                    dataSource={cart}
                                    columns={[
                                        { title: "สินค้า", dataIndex: "p_name", key: "p_name" },
                                        { title: "จำนวน", dataIndex: "quantity", key: "quantity" },
                                        {
                                            title: "ราคารวม (฿)",
                                            key: "sub_total",
                                            render: (_, record) =>
                                                (record.p_price * record.quantity).toLocaleString(),
                                        },
                                    ]}
                                    pagination={false}
                                    rowKey="p_id"
                                />
                                <div
                                    style={{
                                        textAlign: "right",
                                        marginTop: 16,
                                        fontSize: 15,
                                        fontWeight: 500,
                                    }}
                                >
                                    💵 ยอดชำระทั้งหมด:{" "}
                                    <span style={{ color: "#1677ff", fontWeight: 600 }}>
                                        {totalPrice.toLocaleString()} ฿
                                    </span>
                                </div>
                            </>
                        )}
                    </Modal>

                    <Modal
                        title="ชำระเงินผ่าน QR Code"
                        open={paymentModalOpen}
                        onCancel={() => setPaymentModalOpen(false)}
                        onOk={confirmOrder}
                        okText="ยืนยันคำสั่งซื้อ"
                        cancelText="ยกเลิก"
                        width={500}
                    >
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <h3>ยอดที่ต้องชำระทั้งหมด</h3>
                            <p style={{ fontSize: 22, fontWeight: 600, color: "#1677ff" }}>
                                {totalPrice.toLocaleString()} ฿
                            </p>

                            {/* QR Code */}
                            <img
                                src="/payment_qr.png"
                                alt="QR Code"
                                style={{
                                    width: 220,
                                    height: 220,
                                    objectFit: "contain",
                                    marginTop: 10,
                                    border: "1px solid #ddd",
                                    borderRadius: 8,
                                    padding: 8,
                                }}
                            />

                            <p style={{ marginTop: 16, color: "#888" }}>
                                🔍 กรุณาแสกนเพื่อชำระเงิน จากนั้นกรอกเลขที่อ้างอิงด้านล่าง
                            </p>

                            <div style={{ marginTop: 16 }}>
                                <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>
                                    เลขที่อ้างอิงการชำระเงิน <span style={{ color: "red" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="กรอกเลขที่อ้างอิง"
                                    value={transactionCode}
                                    onChange={(e) => setTransactionCode(e.target.value)}
                                    style={{
                                        width: "80%",
                                        padding: 8,
                                        fontSize: 16,
                                        borderRadius: 6,
                                        border: "1px solid #ccc",
                                    }}
                                />
                            </div>
                        </div>
                    </Modal>


                </Content>

            </Layout>
        </Layout>
    );
}

export default CustomerCartPage;
