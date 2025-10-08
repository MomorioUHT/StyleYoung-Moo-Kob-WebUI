import { useState, useEffect } from "react";
import api from "../../middleware/axios";
import { useNavigate } from "react-router-dom";
import { 
    errorNotification, 
    warningNotification, 
    successNotification, 
    infoNotification
} from "../../middleware/displayer";

import { Layout, Menu, Breadcrumb, Avatar, Dropdown, theme, Space, Table, Button, Modal, Form, Input } from "antd";
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

function AdminSupplierManagement() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);

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

    // Fetch suppliers
    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await api.get("/suppliers", {
                headers: {
                    'api-key': API_KEY,
                    Authorization: `Bearer ${token}`
                },
            });
            setSuppliers(res.data);
        } catch (err) {
            errorNotification("โหลดข้อมูลผู้จำหน่ายล้มเหลว", "กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        verifyUser();
        fetchSuppliers();
    }, []);

    const handleMenuClick = (e) => {
        if (e.key === "logout") {
            localStorage.removeItem("token");
            window.location.reload();
        } else {
            navigate(`/administrator/${e.key}`);
        }
    };

    // Add supplier function
    const addSupplier = async () => {
        try {
            const values = await form.validateFields();
            const token = localStorage.getItem("token");

            const phonePattern = /^[0-9]{9}$/;
            if (!phonePattern.test(values.supplier_tel)) {
                warningNotification("ข้อมูลไม่ถูกต้อง", "หมายเลขโทรศัพท์ต้องเป็นตัวเลข 9 หลัก (เบอร์สำนักงาน 02)");
                return;
            }

            const payload = {
                supplier_name: values.supplier_name,
                supplier_tel: values.supplier_tel,
                supplier_address: values.supplier_address
            };

            const res = await api.post("/registersupplier", payload, {
                headers: {
                    'api-key': API_KEY,
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 201) {
                successNotification("เพิ่มผู้จำหน่ายสำเร็จ", res.data.message);
                fetchSuppliers();
                closeModal();
            }
        } catch (err) {
            if (err.response) {
                if (err.response.status === 409) {
                    warningNotification("เพิ่มร้านอาหารล้มเหลว", err.response.data.message);
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

    // Supplier Tables
    const columns = [
        { title: "ID", dataIndex: "sup_id", key: "sup_id" },
        { title: "ชื่อผู้จำหน่าย", dataIndex: "sup_name", key: "sup_name" },
        { title: "เบอร์ผู้จำหน่าย", dataIndex: "sup_tel", key: "sup_tel" },
        { title: "ที่อยู่ผู้จำหน่าย", dataIndex: "sup_address", key: "sup_address" },
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
                    defaultSelectedKeys={["suppliers"]}
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
                        <Breadcrumb.Item>จัดการข้อมูลผู้จำหน่าย</Breadcrumb.Item>
                    </Breadcrumb>

                    <h2> <TruckOutlined /> ข้อมูลผู้จำหน่ายในระบบ</h2>

                    <Space style={{ marginBottom: 16 }}>
                        <Button type="primary" onClick={openModal}><PlusSquareOutlined /> เพิ่มผู้จำหน่าย</Button>
                    </Space>
    
                    <p>
                        <Table
                            columns={columns}
                            dataSource={suppliers}
                            rowKey="sup_id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </p>

                    {/* Modal */}
                    <Modal
                        title="เพิ่มร้านอาหารใหม่"
                        open={isModalOpen}
                        onOk={addSupplier}
                        onCancel={closeModal}
                        okText="บันทึก"
                        cancelText="ยกเลิก"
                    >
                        <Form form={form} layout="vertical">
                            <Form.Item name="supplier_name" label="ชื่อผู้จำหน่าย" rules={[{ required: true, message: 'กรุณากรอกชื่อผู้จำหน่าย' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="supplier_tel" label="เบอร์โทรผู้จำหน่าย" rules={[{ required: true, message: 'กรุณากรอกเบอร์โทรผู้จำหน่าย' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="supplier_address" label="ที่อยู่ผู้จำหน่าย" rules={[{ required: true, message: 'กรุณากรอกที่อยู่ของผู้จำหน่าย' }]}>
                                <Input />
                            </Form.Item>
                        </Form>
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
}

export default AdminSupplierManagement;
