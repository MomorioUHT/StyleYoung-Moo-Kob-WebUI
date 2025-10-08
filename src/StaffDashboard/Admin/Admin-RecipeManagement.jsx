import { useState, useEffect } from "react";
import api from "../../middleware/axios";
import { useNavigate } from "react-router-dom";
import { 
    errorNotification, 
    warningNotification, 
    successNotification, 
    infoNotification
} from "../../middleware/displayer";

import { Layout, Menu, Breadcrumb, Avatar, Dropdown, theme, Space, Card, Modal, Table, Spin, Input, Button } from "antd";
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

function AdminRecipeManagement() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [modalCardVisible, setModalCardVisible] = useState(false);
    const [searchText, setSearchText] = useState("");

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

    useEffect(() => {
        verifyUser();
        fetchRecipes();
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
                    
                </Content>
            </Layout>
        </Layout>
    );
}

export default AdminRecipeManagement;
