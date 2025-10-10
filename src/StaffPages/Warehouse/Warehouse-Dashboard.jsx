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
    RedoOutlined,
    FastForwardOutlined
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

    // Variables for to be added card
    const [incomeModalVisible, setIncomeModalVisible] = useState(false);
    const [toBeAddedProducts, setToBeAddedProducts] = useState([]);
    const [currentProducts, setCurrentProducts] = useState([]);

    const incomeColumns = [
        { title: "ชื่อสินค้า (QC)", key: "p_name" },
        { title: "เกรด", key: "qc_grade", align: "center" },
        { title: "น้ำหนัก", key: "p_weight", align: "center" },
        { title: "จำนวน QC", key: "qc_quantity", align: "center" },
        { title: "เพิ่มเข้าเป็นสินค้า", key: "target_select" },
        { title: "จำนวนที่จะผลิตได้", key: "calculated_quantity", align: "center" },
        { title: "ดำเนินการ", key: "action", align: "center" },
    ];

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

    const fetchToBeAddedProducts = async () => {
        try {
            setLoading(true);
            const [prodWaitToBeAdded, prodCurrent] = await Promise.all([
                api.get("/toBeAddedProducts", { headers: { "api-key": API_KEY } }),
                api.get("/productsFull", { headers: { "api-key": API_KEY } }),
            ]);

            setToBeAddedProducts(prodWaitToBeAdded.data);
            setCurrentProducts(prodCurrent.data);
        } catch (err) {
            console.error(err);
            errorNotification("โหลดข้อมูลไม่สำเร็จ", "โปรดลองอีกครั้ง");
        } finally {
            setLoading(false);
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

    const openIncomeModal = async () => {
        try {
            setLoading(true);
            const [prodWaitToBeAdded, prodCurrent] = await Promise.all([
            api.get("/toBeAddedProducts", { headers: { "api-key": API_KEY } }),
            api.get("/productsFull", { headers: { "api-key": API_KEY } }),
        ]);

        setToBeAddedProducts(prodWaitToBeAdded.data);
        setCurrentProducts(prodCurrent.data);
        setIncomeModalVisible(true);
        } catch {
            errorNotification("โหลดข้อมูลไม่สำเร็จ", "โปรดลองอีกครั้ง");
        } finally {
            setLoading(false);
        }        
    }

    const createSupplyLogs = async () => {
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

    const handleAcceptProduct = async (record) => {
        if (!record.target_p_id) {
            warningNotification("ยังไม่ได้เลือกสินค้า", "กรุณาเลือกสินค้าที่จะเพิ่มเข้าในคลัง");
            return;
        }

        const qcProduct = toBeAddedProducts.find(p => p.qc_id === record.qc_id);
        const currentProduct = currentProducts.find(p => p.p_id === record.target_p_id);

        // ตรวจสอบน้ำหนัก (QC ต้องมี weight >= current)
        if (qcProduct.p_weight < currentProduct.p_weight) {
            warningNotification("น้ำหนักไม่ตรงตามเงื่อนไข", "สินค้าจาก QC ต้องมีน้ำหนักมากกว่าหรือเท่ากับสินค้าปัจจุบัน");
            return;
        }

        // คำนวณจำนวนหน่วยที่จะเพิ่ม
        const get_quantity = Math.floor(
            (qcProduct.qc_quantity * qcProduct.p_weight) / currentProduct.p_weight
        );

        const payload = {
            qc_id: qcProduct.qc_id,
            target_quantity: get_quantity,
            result_p_id: currentProduct.p_id
        };

        try {
            setLoading(true);
            await api.post("/acceptProduct", payload, {
                headers: { "api-key": API_KEY }
            });
            successNotification("สำเร็จ", `เพิ่มสินค้า ${currentProduct.p_name} จำนวน ${get_quantity} หน่วยแล้ว`);
            await fetchToBeAddedProducts(); // รีเฟรชข้อมูลใหม่
        } catch (err) {
            console.error(err);
            errorNotification("ผิดพลาด", "ไม่สามารถเพิ่มสินค้าได้");
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

                        <Card
                            hoverable
                            style={{
                                textAlign: "center",
                                height: 200,
                                borderRadius: 12,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                            onClick={openIncomeModal}
                        >
                            <div style={{ fontSize: 50, color: "#1677ff", marginTop: 20 }}>
                                <FastForwardOutlined />
                            </div>
                            <h3 style={{ marginTop: 20 }}>รับสินค้าหลังจากการแยกเกรด</h3>
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
                            <Button key="save" type="primary" onClick={createSupplyLogs} loading={loading}>
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

                    <Modal
                        title="รับสินค้าหลังจากการแยกเกรด"
                        open={incomeModalVisible}
                        onCancel={() => setIncomeModalVisible(false)}
                        width={1000}
                        footer={[
                            <Button key="cancel" onClick={() => setIncomeModalVisible(false)}>
                                ปิด
                            </Button>,
                        ]}
                    >
                        {loading ? (
                            <Spin />
                        ) : (
                            <>
                                {toBeAddedProducts.length === 0 ? (
                                    <p style={{ textAlign: "center" }}>ไม่มีสินค้าที่รอรับเข้าคลัง</p>
                                ) : (
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            {incomeColumns.map((col) => (
                                                <th
                                                    key={col.key}
                                                    style={{
                                                        padding: 8,
                                                        borderBottom: "1px solid #ddd",
                                                        textAlign: col.align || "left",
                                                    }}
                                                >
                                                    {col.title}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {toBeAddedProducts.map((item) => {
                                            const selectedTarget = currentProducts.find(p => p.p_id === item.target_p_id);
                                            let calculatedQuantity = "-";
                                            if (selectedTarget && selectedTarget.p_weight > 0) {
                                                calculatedQuantity = Math.floor(
                                                    (item.p_weight / selectedTarget.p_weight) * item.qc_quantity
                                                );
                                            }

                                            return (
                                                <tr key={item.qc_id}>
                                                    {incomeColumns.map((col) => {
                                                        switch (col.key) {
                                                            case "p_name":
                                                                return <td key={col.key} style={{ padding: 8 }}>{item.p_name}</td>;

                                                            case "qc_grade":
                                                                return <td key={col.key} style={{ padding: 8, textAlign: "center" }}>{item.qc_grade}</td>;

                                                            case "p_weight":
                                                                return <td key={col.key} style={{ padding: 8, textAlign: "center" }}>{item.p_weight}</td>;

                                                            case "qc_quantity":
                                                                return <td key={col.key} style={{ padding: 8, textAlign: "center" }}>{item.qc_quantity}</td>;

                                                            case "target_select":
                                                                return (
                                                                    <td key={col.key} style={{ padding: 8 }}>
                                                                        <Select
                                                                            style={{ width: "100%" }}
                                                                            dropdownStyle={{ width: 400 }}
                                                                            placeholder="เลือกสินค้า"
                                                                            value={item.target_p_id}
                                                                            onChange={(val) =>
                                                                                setToBeAddedProducts(prev =>
                                                                                    prev.map(p =>
                                                                                        p.qc_id === item.qc_id ? { ...p, target_p_id: val } : p
                                                                                    )
                                                                                )
                                                                            }
                                                                        >
                                                                            {currentProducts
                                                                                .filter(p => p.p_grade === item.qc_grade && item.p_weight >= p.p_weight)
                                                                                .map(p => (
                                                                                    <Option key={p.p_id} value={p.p_id}>
                                                                                        {p.p_name} ({p.p_weight}g)
                                                                                    </Option>
                                                                                ))}
                                                                        </Select>
                                                                    </td>
                                                                );

                                                            case "calculated_quantity":
                                                                return (
                                                                    <td key={col.key} style={{ padding: 8, textAlign: "center" }}>
                                                                        {calculatedQuantity}
                                                                    </td>
                                                                );

                                                            case "action":
                                                                return (
                                                                    <td key={col.key} style={{ padding: 8, textAlign: "center" }}>
                                                                        <Button
                                                                            type="primary"
                                                                            onClick={() => handleAcceptProduct({ ...item, calculatedQuantity })}
                                                                            loading={loading}
                                                                            disabled={!item.target_p_id}
                                                                        >
                                                                            ยืนยัน
                                                                        </Button>
                                                                    </td>
                                                                );

                                                            default:
                                                                return null;
                                                        }
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                )}
                            </>
                        )}
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
}

export default WarehouseDashboard;
