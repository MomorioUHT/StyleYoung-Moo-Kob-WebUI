import { useState, useEffect } from "react";
import api from "../../middleware/axios";
import { useNavigate } from "react-router-dom";
import { 
    errorNotification, 
    warningNotification, 
    successNotification, 
} from "../../middleware/displayer";

import { Layout, Menu, Breadcrumb, Avatar, Dropdown, theme, Space, Card, Modal, Table, Spin, Input, Button, Select } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    DashboardOutlined,
    TeamOutlined,
    HomeOutlined,
    ClusterOutlined,
    LogoutOutlined,
    TruckOutlined,
    ReadOutlined,
    ShoppingCartOutlined,
    ProductOutlined,
    PlusSquareOutlined
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Option } = Select;

function AdminRecipeManagement() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const [recipes, setRecipes] = useState([]);
    const [avaliableProducts, setAvailableProducts] = useState([]);
    const [ingredients, setIngredients] = useState([]);

    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    const [modalCardVisible, setModalCardVisible] = useState(false);
    const [searchText, setSearchText] = useState("");

    // for open New Recipe
    const [addRecipeModalVisible, setAddRecipeModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newIngredients, setNewIngredients] = useState([]);

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    // Verifier User
    const verifyUser = async () => {
        const token = localStorage.getItem("token");

        try {
            const res = await api.get("/verifyUser", {
                headers: {
                    'api-key': API_KEY,
                    Authorization: `Bearer ${token}` 
                },
            });

            if (!res.data.user.s_position) {
                navigate("/welcome")
            } else {
                setUserInfo(res.data.user);
            }
        } catch {
            errorNotification("การตรวจสอบสิทธิ์ล้มเหลว", "กรุณาเข้าสู่ระบบอีกครั้ง")
            navigate('/welcome')
        }
    };

    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const res = await api.get("/recipes", {
                headers: {
                    "api-key": API_KEY,
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
            });
            setRecipes(res.data);
        } catch (err) {
            errorNotification("โหลดข้อมูลสูตรอาหารล้มเหลว", err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get("/availableRecipe", {
                headers: {
                    "api-key": API_KEY,
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
            });
            setAvailableProducts(res.data);
        } catch (err) {
            console.log("NO AVALIABLE RECIPE");
            // errorNotification("โหลดข้อมูลสินค้าที่ยังไม่มีสูตรล้มเหลว", err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchIngredients = async () => {
        setLoading(true);
        try {
            const res = await api.get("/ingredients", {
                headers: {
                    "api-key": API_KEY,
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
            });
            setIngredients(res.data);
        } catch (err) {
            console.log("NO AVALIABLE RECIPE");
            // errorNotification("โหลดข้อมูลสินค้าที่ยังไม่มีสูตรล้มเหลว", err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRecipe = async () => {
        if (!selectedProduct) {
            warningNotification("เกิดข้อผิดพลาด", "กรุณาเลือกสินค้า");
            return;
        }

        if (
            newIngredients.length === 0 ||
            newIngredients.some(
                (i) => !i.i_id || !i.ingre_use_amount || parseFloat(i.ingre_use_amount) <= 0
            )
        ) {
            warningNotification(
                "เกิดข้อผิดพลาด",
                "กรุณาเพิ่มวัตถุดิบอย่างน้อย 1 อัน และกรอกจำนวนที่ใช้ให้ถูกต้อง (มากกว่า 0)"
            );
            return;
        }

        const payload = {
            p_id: selectedProduct.p_id,
            ingredients: newIngredients.map((i) => ({
                i_id: i.i_id,
                ingre_use_amount: parseFloat(i.ingre_use_amount),
            })),
        };

        try {
            const res = await api.post("/registerRecipe", payload, {
                headers: {
                    "api-key": API_KEY,
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            successNotification("สร้างสูตรอาหารสำเร็จ", res.data.message);
            setAddRecipeModalVisible(false);
            fetchRecipes();
            fetchAvailableProducts();
        } catch (err) {
            errorNotification("สร้างสูตรอาหารล้มเหลว", err.message);
        }
    };

    const addIngredientRow = () => {
        setNewIngredients([...newIngredients, { i_id: null, i_name: null, ingre_use_amount: "" }]);
    };

    const removeIngredientRow = (index) => {
        const updated = [...newIngredients];
        updated.splice(index, 1);
        setNewIngredients(updated);
    };

    const updateIngredient = (index, field, value) => {
        const updated = [...newIngredients];
        updated[index][field] = value;
        setNewIngredients(updated);
    };   

    useEffect(() => {
        verifyUser();
        fetchRecipes();
        fetchAvailableProducts();
        fetchIngredients();
    }, []);

    const handleMenuClick = (e) => {
        if (e.key === "logout") {
            localStorage.removeItem("token");
            window.location.reload();
        } else {
            navigate(`/administrator/${e.key}`);
        }
    };

    const openRecipeModal = (recipe) => {
        setSelectedRecipe(recipe);
        setModalCardVisible(true);
    };

    const openAddRecipeModal = () => {
        setSelectedProduct(null);
        setNewIngredients([]);
        setAddRecipeModalVisible(true);
    };

    const menuItems = [
        { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
        { key: "staffs", icon: <TeamOutlined />, label: "จัดการข้อมูลพนักงาน" },
        { key: "products", icon: <ShoppingCartOutlined />, label: "จัดการข้อมูลสินค้า"},
        { key: "suppliers", icon: <TruckOutlined />, label: "จัดการข้อมูลผู้จำหน่าย"},
        { key: "restaurants", icon: <HomeOutlined />, label: "จัดการข้อมูลร้านอาหาร"},
        { key: "ingredients", icon: <ProductOutlined />, label: "จัดการข้อมูลวัตถุดิบ"},
        { key: "recipes", icon: <ReadOutlined />, label: "จัดการข้อมูลสูตรอาหาร"},
        { key: "customers", icon: <ClusterOutlined />, label: "ข้อมูลลูกค้า" },
    ];

    const userMenuItems = [
        { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
    ];

    // PerCard Recipes
    const columns = [
        { title: "ID", dataIndex: "i_id", key: "i_id" },
        { title: "ชื่อวัตถุดิบ", dataIndex: "i_name", key: "i_name" },
        { title: "ปริมาณที่ใช้", dataIndex: "ingre_use_amount", key: "ingre_use_amount" },
    ];

    return (
        <Layout
            style={{
                height: "100vh",
                width: "100vw",
                overflow: "hidden",
            }}
        >
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
                        transition: "all 0.3s ease",
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
                                transition: "opacity 0.3s",
                            }}
                        />
                    )}
                    <span>{collapsed ? "Admin" : "Admin Panel"}</span>
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={["recipes"]}
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
                                {userInfo.s_firstname} {userInfo.s_lastname} ({userInfo.s_username})
                            </span>
                        )}

                        {/* Dropdown Avatar */}
                        <Dropdown
                            menu={{
                                items: userMenuItems,
                                onClick: handleMenuClick,
                            }}
                        >
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
                        <Breadcrumb.Item>Admin</Breadcrumb.Item>
                        <Breadcrumb.Item>จัดการข้อมูลสูตรอาหาร</Breadcrumb.Item>
                    </Breadcrumb>

                    <h2>
                        <ReadOutlined /> ข้อมูลสูตรอาหารในระบบ
                    </h2>

                    <Input.Search
                        placeholder="ค้นหาสูตรอาหาร"
                        allowClear
                        enterButton="ค้นหา"
                        size="middle"
                        style={{ maxWidth: 350, marginBottom: 20 }}
                        onSearch={(value) => setSearchText(value)}
                        onChange={(e) => setSearchText(e.target.value)}
                        value={searchText}
                    />

                    <br />
                    <Space style={{ marginBottom: 16 }}>
                        <Button type="primary" onClick={openAddRecipeModal}><PlusSquareOutlined /> เพิ่มสูตรอาหาร</Button>
                    </Space>   

                    {loading ? (
                        <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
                    ) : (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                                gap: "20px",
                                marginTop: "20px",
                            }}
                        >
                            {recipes
                                .filter((item) => {
                                    const product = item.product_recipe;
                                    return product.p_name
                                        .toLowerCase()
                                        .includes(searchText.toLowerCase());
                                })
                                .map((item) => {
                                    const product = item.product_recipe;
                                    return (
                                        <Card
                                            key={product.p_id}
                                            hoverable
                                            style={{
                                                textAlign: "center",
                                                height: 200,
                                                borderRadius: 12,
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                            }}
                                            onClick={() => openRecipeModal(product)}
                                        >
                                            <ReadOutlined
                                                style={{ fontSize: 50, color: "#1677ff", marginTop: 20 }}
                                            />
                                            <h3 style={{ marginTop: 20 }}>{product.p_name}</h3>
                                        </Card>
                                    );
                                })}
                        </div>
                    )}

                    <Modal
                        open={modalCardVisible}
                        title={
                            selectedRecipe
                                ? `สูตรอาหาร: ${selectedRecipe.p_name}`
                                : "สูตรอาหาร"
                        }
                        onCancel={() => setModalCardVisible(false)}
                        footer={null}
                        width={700}
                    >
                        {selectedRecipe && (
                            <Table
                                columns={columns}
                                dataSource={selectedRecipe.ingredients.map((ing) => ({
                                    key: ing.i_id,
                                    ...ing,
                                }))}
                                pagination={false}
                            />
                        )}
                    </Modal>

                    <Modal
                        open={addRecipeModalVisible}
                        title="เพิ่มสูตรอาหารใหม่"
                        onCancel={() => setAddRecipeModalVisible(false)}
                        footer={null}
                        width={800}
                    >
                        <Space direction="vertical" style={{ width: "100%" }}>
                            {/* เลือก product */}
                            <Select
                                placeholder="เลือกสินค้า"
                                style={{ width: "100%" }}
                                value={selectedProduct?.p_id || undefined}
                                onChange={(value) => {
                                    const prod = avaliableProducts.find(p => p.p_id === value);
                                    setSelectedProduct(prod);
                                }}
                            >
                                {avaliableProducts.map((p) => (
                                    <Option key={p.p_id} value={p.p_id}>
                                        {p.p_name}
                                    </Option>
                                ))}
                            </Select>

                            {newIngredients.map((ing, idx) => (
                                <Space key={idx} style={{ display: "flex", marginBottom: 8 }} align="start">
                                    <Select
                                        placeholder="เลือกวัตถุดิบ"
                                        style={{ width: 200 }}
                                        value={ing.i_id || undefined}
                                        onChange={(value) => {
                                            const ingObj = ingredients.find(i => i.i_id === value);
                                            updateIngredient(idx, "i_id", ingObj.i_id);
                                            updateIngredient(idx, "i_name", ingObj.i_name);
                                        }}
                                    >
                                        {ingredients
                                            .filter(i => {
                                                return !newIngredients.some((ingRow, rIdx) => rIdx !== idx && ingRow.i_id === i.i_id);
                                            })
                                            .map((i) => (
                                                <Option key={i.i_id} value={i.i_id}>
                                                    {i.i_name}
                                                </Option>
                                            ))}
                                    </Select>

                                    <Input
                                        placeholder="จำนวนที่ใช้"
                                        type="number"
                                        value={ing.ingre_use_amount}
                                        onChange={(e) => updateIngredient(idx, "ingre_use_amount", e.target.value)}
                                    />

                                    <Button danger onClick={() => removeIngredientRow(idx)}>ลบ</Button>
                                </Space>
                            ))}


                            <Button type="dashed" onClick={addIngredientRow} style={{ width: "100%" }}>
                                + เพิ่มวัตถุดิบ
                            </Button>

                            <Button
                                type="primary"
                                onClick={handleSaveRecipe} 
                            >
                                บันทึก
                            </Button>
                        </Space>
                    </Modal>
                    
                </Content>
            </Layout>
        </Layout>
    );
}

export default AdminRecipeManagement;
