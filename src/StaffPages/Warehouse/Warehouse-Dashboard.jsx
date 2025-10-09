import { useState, useEffect } from "react";
import api from "../../middleware/axios";
import { useNavigate } from "react-router-dom";
import { 
    errorNotification,
    warningNotification,
    successNotification,
} from "../../middleware/displayer";

import { Layout, Menu, Breadcrumb, Avatar, Dropdown, theme, Space, Card, Spin, Select, Modal, InputNumber, Button } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    DashboardOutlined,
    LogoutOutlined,
    RightCircleOutlined,
    ReadOutlined,
    AuditOutlined,
    ShoppingOutlined,
    RedoOutlined 
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Option } = Select;

function WarehouseDashboard() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const [receiveModalVisible, setReceiveModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(0);

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const menuItems = [
        { key: "dashboard", icon: <DashboardOutlined />, label: "หน้าหลัก" },
        { key: "supplylogs", icon: <RedoOutlined />, label: "ประวัติการรับวัตถุดิบ" }
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
            navigate(`/warehouse/${e.key}`);
        }
    };

    const userMenuItems = [{ key: "logout", icon: <LogoutOutlined />, label: "Logout" }];

        const openModal = async () => {
            setReceiveModalVisible(true);
            try {
                setLoading(true);
                const [supRes, ingreRes] = await Promise.all([
                    api.get("/suppliers", { headers: { "api-key": API_KEY } }),
                    api.get("/ingredients", { headers: { "api-key": API_KEY } }),
                ]);
                setSuppliers(supRes.data);
                setProducts(ingreRes.data);
            } catch {
                errorNotification("โหลดข้อมูลไม่สำเร็จ", "โปรดลองอีกครั้ง");
            } finally {
                setLoading(false);
            }
        };

    const handleSave = async () => {
        if (!selectedSupplier || !selectedProduct || !quantity || quantity <= 0 || !Number.isInteger(quantity)) {
            warningNotification(
                "เกิดข้อผิดพลาด",
                "ข้อมูลไม่ครบหรือไม่ถูกต้อง"
            );
            return;
        }

        try {
            setLoading(true);
            await api.post(
                "/createSupplyLogs",
                {
                    supplier_id: selectedSupplier,
                    ingredient_id: selectedProduct,
                    supply_quantity: quantity,
                },
                { headers: { "api-key": API_KEY } }
            );
            successNotification("สำเร็จ", "บันทึกการรับวัตถุดิบเข้าคลังเรียบร้อยแล้ว");
            setReceiveModalVisible(false);
            setSelectedSupplier(null);
            setSelectedProduct(null);
            setQuantity(0);
        } catch {
            errorNotification("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
        } finally {
            setLoading(false);
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
                        <Breadcrumb.Item>Warehouse</Breadcrumb.Item>
                        <Breadcrumb.Item>หน้าหลัก</Breadcrumb.Item>
                    </Breadcrumb>

                    <h2>
                        <ReadOutlined /> หน้าหลักคลังสินค้า
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
                                height: 200,
                                borderRadius: 12,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                            onClick={openModal}
                        >
                            <div style={{ fontSize: 50, color: "#1677ff", marginTop: 20 }}>
                                <RightCircleOutlined />
                            </div>
                            <h3 style={{ marginTop: 20 }}>รับวัตถุดิบเข้าคลัง</h3>
                        </Card>

                        <Card
                            hoverable
                            style={{
                                textAlign: "center",
                                height: 200,
                                borderRadius: 12,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                            // onClick={openModal}
                        >
                            <div style={{ fontSize: 50, color: "#1677ff", marginTop: 20 }}>
                                <AuditOutlined />
                            </div>
                            <h3 style={{ marginTop: 20 }}>รับสินค้าหลังการแยกเกรด</h3>
                        </Card>

                        <Card
                            hoverable
                            style={{
                                textAlign: "center",
                                height: 200,
                                borderRadius: 12,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                            // onClick={openModal}
                        >
                            <div style={{ fontSize: 50, color: "#1677ff", marginTop: 20 }}>
                                <ShoppingOutlined />
                            </div>
                            <h3 style={{ marginTop: 20 }}>จัดของตามคำสั่งซื้อ</h3>
                        </Card>
                    </div>

                    {/* Modal */}
                    <Modal
                        title="รับวัตถุดิบเข้าคลัง"
                        open={receiveModalVisible}
                        onCancel={() => setReceiveModalVisible(false)}
                        footer={[
                            <Button key="cancel" onClick={() => setReceiveModalVisible(false)}>
                                ยกเลิก
                            </Button>,
                            <Button key="save" type="primary" onClick={handleSave} loading={loading}>
                                บันทึก
                            </Button>,
                        ]}
                    >
                        {loading ? (
                            <Spin />
                        ) : (
                            <>
                                <p><b>เลือกผู้จำหน่ายที่จะนำของเข้า:</b></p>
                                <Select
                                    style={{ width: "100%", marginBottom: 16 }}
                                    placeholder="เลือกผู้จำหน่าย"
                                    value={selectedSupplier}
                                    onChange={setSelectedSupplier}
                                >
                                    {suppliers.map((sup) => (
                                        <Option key={sup.sup_id} value={sup.sup_id}>
                                            {sup.sup_name}
                                        </Option>
                                    ))}
                                </Select>

                                <p><b>เลือกวัตถุดิบที่จะรับเข้า:</b></p>
                                <Select
                                    style={{ width: "100%", marginBottom: 16 }}
                                    placeholder="เลือกวัตถุดิบ"
                                    value={selectedProduct}
                                    onChange={setSelectedProduct}
                                >
                                    {products.map((ing) => (
                                        <Option key={ing.i_id} value={ing.i_id}>
                                            {ing.i_name}
                                        </Option>
                                    ))}
                                </Select>

                                <p><b>จำนวนที่นำเข้า (หน่วย):</b></p>
                                <InputNumber
                                    style={{ width: "100%" }}
                                    placeholder="กรอกจำนวน"
                                    value={quantity}
                                    onChange={setQuantity}
                                />
                            </>
                        )}
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
}

export default WarehouseDashboard;
