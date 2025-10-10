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
    ReadOutlined,
    UnorderedListOutlined,
    MergeCellsOutlined,
    FastForwardOutlined
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Option } = Select;

function ProductionDashboard() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);


    const [loading, setLoading] = useState(false);

    // Variables for production card
    const [products, setProducts] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);

    const {
        token: { colorBgContainer },
    } = theme.useToken();

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

    useEffect(() => {
        verifyUser();
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

    const openModal = async () => {
        setModalVisible(true);
        try {
            setLoading(true);
            const [prodRes, ingreRes, recipeRes] = await Promise.all([
            api.get("/productsWithRecipe", { headers: { "api-key": API_KEY } }),
            api.get("/ingredients", { headers: { "api-key": API_KEY } }),
            api.get("/recipes", { headers: { "api-key": API_KEY } }),
        ]);

        setProducts(prodRes.data);
        setIngredients(ingreRes.data);

        const recipeData = recipeRes.data.map(r => r.product_recipe);
        setRecipes(recipeData);
        } catch {
            errorNotification("โหลดข้อมูลไม่สำเร็จ", "โปรดลองอีกครั้ง");
        } finally {
            setLoading(false);
        }
    };


    const handleProduce =  async () => {
        if (!selectedProduct || quantity <= 0 || !Number.isInteger(quantity)) {
            warningNotification("ข้อมูลไม่ถูกต้อง", "กรุณาเลือกสินค้าและกรอกจำนวนการผลิตที่ถูกต้อง");
            return;
        }

        const selectedRecipe = recipes.find(r => r.p_id === selectedProduct)?.ingredients || [];

        const insufficient = selectedRecipe.some(ingre => {
            const available = ingredients.find(i => i.i_id === ingre.i_id)?.i_amount || 0;
            return quantity * ingre.ingre_use_amount > available;
        });

        if (insufficient) {
            warningNotification("วัตถุดิบไม่เพียงพอ", "จำนวนการผลิตมากกว่าวัตถุดิบที่มีในระบบ");
            return;
        }

        const payload = {
            product_id: selectedProduct,
            produce_quantity: quantity,
            ingredients: selectedRecipe.map(ingre => ({
                i_id: ingre.i_id,
                ingre_use_amount: ingre.ingre_use_amount * quantity
            })),
        };

        try {
            setLoading(true);
            await api.post("/createProductionLogs", payload, {
                headers: { "api-key": API_KEY }
            });

            successNotification("สำเร็จ", "บันทึกการผลิตเรียบร้อยแล้ว");

            setModalVisible(false);
            setSelectedProduct(null);
            setQuantity(0);
        } catch (err) {
            console.error(err);
            errorNotification("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกการผลิตได้");
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
                    <span>{collapsed ? "Production" : "Production Panel"}</span>
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
                        <Breadcrumb.Item>Production</Breadcrumb.Item>
                        <Breadcrumb.Item>หน้าหลัก</Breadcrumb.Item>
                    </Breadcrumb>

                    <h2>
                        <ReadOutlined /> หน้าหลักฝ่ายการผลิต
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
                                <MergeCellsOutlined />
                            </div>
                            <h3 style={{ marginTop: 20 }}>ผลิตสินค้า</h3>
                        </Card>
                    </div>

                    {/* Modal */}
                    <Modal
                        title="ผลิตสินค้า"
                        open={modalVisible}
                        onCancel={() => setModalVisible(false)}
                        width={700}
                        footer={[
                            <Button key="cancel" onClick={() => setModalVisible(false)}>
                                ยกเลิก
                            </Button>,
                            <Button key="save" type="primary" onClick={handleProduce} loading={loading}>
                                ตรวจสอบ / บันทึก
                            </Button>,
                        ]}
                    >
                        {loading ? (
                            <Spin />
                        ) : (
                            <>
                                <p><b>เลือกสินค้าที่ต้องการจะผลิต:</b></p>
                                <Select
                                    style={{ width: "100%", marginBottom: 16 }}
                                    placeholder="เลือกสินค้า"
                                    value={selectedProduct}
                                    onChange={setSelectedProduct}
                                >
                                    {products.map((p) => (
                                        <Option key={p.p_id} value={p.p_id}>
                                            {p.p_name}
                                        </Option>
                                    ))}
                                </Select>

                                <p><b>จำนวนที่ผลิต (หน่วย):</b></p>
                                <InputNumber
                                    style={{ width: "100%", marginBottom: 16 }}
                                    placeholder="กรอกจำนวน"
                                    value={quantity}
                                    onChange={setQuantity}
                                />

                                {selectedProduct && (() => {
                                const selectedRecipe = recipes.find(r => r.p_id === selectedProduct)?.ingredients || [];
                                return (
                                    <>
                                    <p><b>สูตรวัตถุดิบ:</b></p>
                                    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
                                        <thead>
                                        <tr>
                                            <th style={{ borderBottom: "1px solid #ccc", padding: 8, textAlign: "left" }}>วัตถุดิบ</th>
                                            <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>สูตรต่อหน่วย</th>
                                            <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>จำนวนผลิต</th>
                                            <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>จำนวนที่ต้องใช้</th>
                                            <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>คงเหลือในระบบ</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {selectedRecipe.map((ingre) => {
                                            const totalNeeded = quantity * ingre.ingre_use_amount;
                                            const available = ingredients.find(i => i.i_id === ingre.i_id)?.i_amount || 0;
                                            const isExceed = totalNeeded > available;
                                            return (
                                            <tr key={ingre.i_id} style={{ background: isExceed ? "#ffe6e6" : "transparent" }}>
                                                <td style={{ padding: 8 }}>{ingre.i_name}</td>
                                                <td style={{ padding: 8, textAlign: "center" }}>{ingre.ingre_use_amount}</td>
                                                <td style={{ padding: 8, textAlign: "center" }}>{quantity}</td>
                                                <td style={{ padding: 8, textAlign: "center" }}>{totalNeeded}</td>
                                                <td style={{ padding: 8, textAlign: "center" }}>{available}</td>
                                            </tr>
                                            )
                                        })}
                                        </tbody>
                                    </table>
                                    </>
                                )
                                })()}

                            </>
                        )}
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
}

export default ProductionDashboard;
