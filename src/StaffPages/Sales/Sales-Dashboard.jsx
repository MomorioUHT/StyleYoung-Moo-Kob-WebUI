import { useState, useEffect } from "react";
import api from "../../middleware/axios";
import { useNavigate } from "react-router-dom";
import { 
    errorNotification,
    warningNotification,
    successNotification
} from "../../middleware/displayer";

import { Layout, Menu, Breadcrumb, Avatar, Dropdown, theme, Space, Card, Modal, Table, Select, Input, Button } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    BarChartOutlined,
    UnorderedListOutlined,
    FormOutlined,
    HomeOutlined,
    TruckOutlined
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

// Layout constants
const SIDER_WIDTH = 250;

/**
 * Sales Dashboard Component
 * Allows sales staff to create orders for restaurant partners
 * Displays available products and manages order creation workflow
 * 
 * @returns {JSX.Element} The sales dashboard with restaurant order creation
 */
function SalesDashboard() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [quantity, setQuantity] = useState(null);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const menuItems = [
        { key: "dashboard", icon: <HomeOutlined />, label: "หน้าหลัก" },
        { key: "customer-orders", icon: <UnorderedListOutlined />, label: "คำสั่งซื้อจากลูกค้า"},
        { key: "restaurant-orders", icon: <UnorderedListOutlined />, label: "คำสั่งซื้อจากร้านอาหาร"},
        { key: "delivery", icon: <TruckOutlined />, label: "จัดการการส่งของ"}
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

    useEffect(() => {
        verifyUser();
    }, []);

    const handleMenuClick = (e) => {
        if (e.key === "logout") {
            localStorage.removeItem("token");
            window.location.reload();
        } else {
            navigate(`/sales/${e.key}`);
        }
    };

    const userMenuItems = [{ key: "logout", icon: <LogoutOutlined />, label: "Logout" }];

    const fetchProductsForRestaurant = async () => {
        try {
            const res = await api.get("/productsForRestaurant", {
                headers: { "api-key": API_KEY },
            });
            setProducts(res.data);
        } catch (err) {
            warningNotification("โหลดสินค้าไม่สำเร็จ");
        }
    };

    const fetchRestaurants = async () => {
        try {
            const res = await api.get("/restaurants", {
                headers: { "api-key": API_KEY },
            });
            setRestaurants(res.data);
        } catch (err) {
            warningNotification("โหลดร้านอาหารไม่สำเร็จ");
        }
    };

    const createRestaurantOrder = () => {
        setIsModalOpen(true);
        fetchProductsForRestaurant();
        fetchRestaurants();
    };

    const handleCreateOrder = () => {
        if (!selectedProduct || !selectedRestaurant) {
            warningNotification("เกิดข้อผิดพลาด","กรุณาเลือกร้านอาหาร และสินค้าให้ครบ");
            return;
        }

        const parsedQty = parseInt(quantity, 10);
        if (isNaN(parsedQty) || parsedQty <= 0) {
            warningNotification("เกิดข้อผิดพลาด","กรุณากรอกจำนวนสินค้าเป็นจำนวนเต็มมากกว่า 0");
            return;
        }

        const productObj = products.find((p) => p.p_id === selectedProduct);

        if (parsedQty > productObj.p_quantity) {
            warningNotification(`จำนวนสินค้าไม่สามารถมากกว่า ${productObj.p_quantity} ได้`);
            return;
        }

        setQuantity(parsedQty);
        setConfirmModalVisible(true);
    };

    const handleConfirmOrder = async () => {
        try {
            const productObj = products.find((p) => p.p_id === selectedProduct);
            const total_payment = productObj.p_price * quantity;

            await api.post(
                "/createRestaurantOrder",
                {
                    staff_id: userInfo.s_id,
                    restaurant_id: selectedRestaurant,
                    product_id: selectedProduct,
                    quantity: quantity,
                    total_payment: total_payment,
                },
                { headers: { "api-key": API_KEY } }
            );

            successNotification("สร้าง Order สำเร็จ");
            setConfirmModalVisible(false);
            setIsModalOpen(false);
            setSelectedProduct(null);
            setSelectedRestaurant(null);
            setQuantity(1);
        } catch (err) {
            warningNotification("สร้าง Order ล้มเหลว");
        }
    };

    const columns = [
        {
            title: "ร้านอาหาร",
            key: "restaurant",
            render: () => (
                <Select
                    style={{ width: "100%" }}
                    placeholder="เลือกร้านอาหาร"
                    onChange={(val) => setSelectedRestaurant(val)}
                    options={restaurants.map((r) => ({
                        value: r.r_id,
                        label: r.r_name
                    }))}
                    dropdownMatchSelectWidth={300} // เพิ่มความกว้าง dropdown
                />
            ),
        },
        {
            title: "สินค้า",
            key: "product",
            render: () => (
                <Select
                    style={{ width: "100%" }}
                    placeholder="เลือกสินค้า"
                    onChange={(val) => setSelectedProduct(val)}
                    options={products.map((p) => ({
                        value: p.p_id,
                        label: `${p.p_name} (คงเหลือ ${p.p_quantity})`
                    }))}
                    dropdownMatchSelectWidth={300}
                />
            ),
        },
        {
            title: "จำนวน",
            key: "quantity",
            render: () => (
                <Input
                    value={quantity !== null ? quantity : ""}
                    onChange={(e) => setQuantity(e.target.value)}
                    style={{ width: "100%" }}
                    placeholder="กรอกจำนวน"
                />
            ),
        },
        {
            title: "ราคาต่อหน่วย (฿)",
            key: "price",
            render: () => {
                const productObj = products.find((p) => p.p_id === selectedProduct);
                return <span>{productObj ? productObj.p_price : 0}</span>;
            },
        },
        {
            title: "คงเหลือในระบบ",
            key: "stock",
            render: () => {
                const productObj = products.find((p) => p.p_id === selectedProduct);
                return <span>{productObj ? productObj.p_quantity : 0}</span>;
            },
        },
        {
            title: "ราคารวม (฿)",
            key: "total",
            render: () => {
                const productObj = products.find((p) => p.p_id === selectedProduct);
                return <span>{productObj ? productObj.p_price * quantity : 0}</span>;
            },
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
                    <span>{collapsed ? "Sales" : "Sales Panel"}</span>
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={["dashboard"]}
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
                        <Breadcrumb.Item>Sales</Breadcrumb.Item>
                        <Breadcrumb.Item>หน้าหลัก</Breadcrumb.Item>
                    </Breadcrumb>

                    <h2>
                        <BarChartOutlined /> หน้าหลักฝ่ายขาย
                    </h2>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                            gap: "20px",
                            marginTop: "20px",
                        }}
                    >
                        <Card
                            hoverable
                            style={{
                                textAlign: "center",
                                height: 230,
                                borderRadius: 16,
                                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-4px)";
                                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
                            }}
                            onClick={createRestaurantOrder}
                        >
                            <div style={{ fontSize: 50, color: "#1677ff", marginTop: 20 }}>
                                <FormOutlined />
                            </div>
                            <h3 style={{ marginTop: 20 }}>สร้าง Order ร้านอาหาร</h3>
                        </Card>
                    </div>

                    {/* Modal สร้าง Order */}
                    <Modal
                        title="สร้าง Order ร้านอาหาร"
                        open={isModalOpen}
                        onCancel={() => setIsModalOpen(false)}
                        width={700} // กำหนดความกว้าง
                        bodyStyle={{ maxHeight: "60vh", overflowY: "auto" }} // scrollable
                        footer={[
                            <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                                ยกเลิก
                            </Button>,
                            <Button key="create" type="primary" onClick={handleCreateOrder}>
                                สร้าง Order
                            </Button>,
                        ]}
                    >
                        <Table
                            dataSource={[{ key: 1 }]}
                            columns={columns}
                            pagination={false}
                            scroll={{ y: 300 }}
                            size="small"
                        />
                    </Modal>

                    {/* Modal ยืนยัน Order */}
                    <Modal
                        title="ยืนยัน Order"
                        open={confirmModalVisible}
                        onCancel={() => setConfirmModalVisible(false)}
                        footer={[
                            <Button key="back" onClick={() => setConfirmModalVisible(false)}>
                                ยกเลิก
                            </Button>,
                            <Button key="submit" type="primary" onClick={handleConfirmOrder}>
                                ยืนยัน
                            </Button>,
                        ]}
                    >
                        <p>ร้านอาหาร: {restaurants.find((r) => r.r_id === selectedRestaurant)?.r_name}</p>
                        <p>สินค้า: {products.find((p) => p.p_id === selectedProduct)?.p_name}</p>
                        <p>ราคาต่อหน่วย: {products.find((p) => p.p_id === selectedProduct)?.p_price} บาท</p>
                        <p>จำนวน: {quantity}</p>
                        <p>
                            ราคารวม: {products.find((p) => p.p_id === selectedProduct)?.p_price * quantity} บาท
                        </p>
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
}

export default SalesDashboard;
