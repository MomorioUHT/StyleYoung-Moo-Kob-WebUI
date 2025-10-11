import { useState, useEffect } from "react";
import api from "../../middleware/axios";
import { useNavigate } from "react-router-dom";
import { 
    errorNotification, 
    warningNotification, 
    successNotification, 
    infoNotification
} from "../../middleware/displayer";

import { Layout, Menu, Breadcrumb, Avatar, Dropdown, theme, Space, Table, Button, Modal, Form, Input, Select } from "antd";
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

function AdminProductManagement() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    // Modal Handlers
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

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

    // Fetch Products
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await api.get("/productsFull", {
                headers: {
                    'api-key': API_KEY,
                    Authorization: `Bearer ${token}`
                },
            });
            setProducts(res.data);
        } catch (err) {
            errorNotification("โหลดข้อมูลผลิตภัณฑ์ล้มเหลว", "กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        verifyUser();
        fetchProducts();
    }, []);

    const handleMenuClick = (e) => {
        if (e.key === "logout") {
            localStorage.removeItem("token");
            window.location.reload();
        } else {
            navigate(`/administrator/${e.key}`);
        }
    };

    // Add Product function
    const addProduct = async () => {
        try {
            const values = await form.validateFields();
            const token = localStorage.getItem("token");

            const price = Number(values.product_price);
            const weight = Number(values.product_weight);

            if (isNaN(price) || isNaN(weight)) {
                warningNotification("ข้อมูลไม่ถูกต้อง", "กรุณากรอกราคาและน้ำหนักให้เป็นตัวเลข");
                return;
            }
            if (price <= 0 || weight <= 0) {
                warningNotification("ข้อมูลไม่ถูกต้อง", "ราคาหรือน้ำหนักต้องมากกว่า 0");
                return;
            }

            const formData = new FormData();
            formData.append("product_name", values.product_name);
            formData.append("product_price", price);
            formData.append("product_weight", weight);
            formData.append("product_grade", values.product_grade);
            
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput && fileInput.files.length > 0) {
                formData.append("p_picture", fileInput.files[0]);
            }

            const res = await api.post("/registerProduct", formData, {
                headers: {
                    'api-key': API_KEY,
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data', // สำคัญ
                },
            });

            if (res.status === 201) {
                successNotification("เพิ่มสินค้าสำเร็จ", res.data.message);
                fetchProducts();
                closeModal();
            }
        } catch (err) {
            if (err.response) {
                if (err.response.status === 409) {
                    warningNotification("เพิ่มสินค้าล้มเหลว", err.response.data.message);
                } else if (err.response.status === 500) {
                    errorNotification("เกิดข้อผิดพลาด", err.response.data.message);
                }
            } else {
                errorNotification("เกิดข้อผิดพลาด", "กรุณาตรวจสอบข้อมูลอีกครั้งหรือลองใหม่");
            }
        }
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

    // Products Table
    const columns = [
        { title: "ID", dataIndex: "p_id", key: "p_id" },
        { title: "ชื่อสินค้า", dataIndex: "p_name", key: "p_name" },
        { title: "เกรดของสินค้า", dataIndex: "p_grade", key: "p_grade" },
        { title: "น้ำหนัก (กิโลกรัม)", dataIndex: "p_weight", key: "p_weight" },
        { title: "ปริมาณที่มี (หน่วย)", dataIndex: "p_quantity", key: "p_quantity" },
        { title: "ราคาต่อหน่วย", dataIndex: "p_price", key: "p_price" }
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
                    defaultSelectedKeys={["products"]}
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
                        <Breadcrumb.Item>จัดการข้อมูลสินค้า</Breadcrumb.Item>
                    </Breadcrumb>

                    <h2> <ShoppingCartOutlined /> ข้อมูลสินค้าในระบบ</h2>

                    <Input.Search
                        placeholder="ค้นหาสินค้า"
                        allowClear
                        enterButton="ค้นหา"
                        size="middle"
                        style={{ maxWidth: 350, marginBottom: 20 }}
                        onSearch={(value) => setSearchText(value)}
                        onChange={(e) => setSearchText(e.target.value)}
                    />

                    <br />
                    <Space style={{ marginBottom: 16 }}>
                        <Button type="primary" onClick={openModal}><PlusSquareOutlined /> เพิ่มสินค้า</Button>
                    </Space>                    

                    <Table
                        columns={columns}
                        dataSource={products.filter((item) => {
                            if (!searchText) return true;
                            const lower = searchText.toLowerCase();
                            return Object.values(item).some((val) =>
                                String(val).toLowerCase().includes(lower)
                            );
                        })}
                        rowKey="c_id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />

                    {/* Modal */}
                    <Modal
                        title="เพิ่มสินค้า"
                        open={isModalOpen}
                        onOk={addProduct}
                        onCancel={closeModal}
                        okText="บันทึก"
                        cancelText="ยกเลิก"
                    >
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name="product_name"
                            label="ชื่อสินค้า"
                            rules={[{ required: true, message: 'กรุณากรอกชื่อสินค้า' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="product_price"
                            label="ราคาของสินค้า"
                            rules={[{ required: true, message: 'กรุณากรอกราคาสินค้า' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="product_weight"
                            label="น้ำหนักของสินค้า (กิโลกรัม)"
                            rules={[{ required: true, message: 'กรุณากรอกน้ำหนักสินค้า' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="product_grade"
                            label="เกรดของสินค้า"
                            rules={[{ required: true, message: 'กรุณาเลือกเกรดของสินค้า' }]}
                        >
                            <Select placeholder="เลือกตำแหน่ง">
                                <Option value="1">สำหรับขายลูกค้า</Option>
                                <Option value="2">สำหรับขายร้านอาหาร</Option>
                                <Option value="0">สำหรับผลิต</Option>
                            </Select>
                        </Form.Item>

                        {/* เพิ่ม Input สำหรับรูปสินค้า */}
                        <Form.Item
                            name="p_picture"
                            label="รูปสินค้า"
                            rules={[{ required: true, message: 'กรุณาอัปโหลดรูปสินค้า' }]}
                        >
                            <Input type="file" accept="image/*" />
                        </Form.Item>
                    </Form>
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
}

export default AdminProductManagement;
