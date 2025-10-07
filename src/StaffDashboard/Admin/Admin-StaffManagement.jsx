import { useState, useEffect } from "react";
import api from "../../middleware/axios";
import { useNavigate } from "react-router-dom";
import { 
    errorNotification, 
    warningNotification, 
    successNotification
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

function AdminStaffManagement() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const [staffs, setStaffs] = useState([]);
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

    // Fetch staffs
    const fetchStaffs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await api.get("/staffs", {
                headers: {
                    'api-key': API_KEY,
                    Authorization: `Bearer ${token}`
                },
            });
            setStaffs(res.data);
        } catch (err) {
            errorNotification("โหลดข้อมูลพนักงานล้มเหลว", "กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }
    };

    // Add staff function
    const addStaff = async () => {
        try {
            const values = await form.validateFields();
            const token = localStorage.getItem("token");

            const { firstname, lastname, phone, position, username, password } = values;

            if (username.length < 5 || username.length > 15) {
                warningNotification("ข้อมูลไม่ถูกต้อง", "ชื่อผู้ใช้ต้องมีความยาวระหว่าง 5 ถึง 15 ตัวอักษร");
                return;
            }

            const phonePattern = /^[0-9]{10}$/;
            if (!phonePattern.test(phone)) {
                warningNotification("ข้อมูลไม่ถูกต้อง", "หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก");
                return;
            }

            if (password.length < 7 || password.length > 20) {
                warningNotification("ข้อมูลไม่ถูกต้อง", "รหัสผ่านต้องมีความยาวระหว่าง 7 ถึง 20 ตัวอักษร");
                return;
            }

            const payload = {
                firstname,
                lastname,
                phone,
                position,
                username,
                password,
            };

            const res = await api.post("/registerStaff", payload, {
                headers: {
                    'api-key': API_KEY,
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 201) {
                successNotification("เพิ่มพนักงานสำเร็จ", res.data.message);
                fetchStaffs();
                closeModal();
            }
        } catch (err) {
            if (err.response) {
                if (err.response.status === 409) {
                    warningNotification("เพิ่มพนักงานล้มเหลว", err.response.data.message);
                } else if (err.response.status === 500) {
                    errorNotification("เกิดข้อผิดพลาด", err.response.data.message);
                }
            } else {
                errorNotification("เกิดข้อผิดพลาด", "กรุณาตรวจสอบข้อมูลอีกครั้งหรือลองใหม่");
            }
        }
    };

    useEffect(() => {
        verifyUser();
        fetchStaffs();
    }, []);

    const handleMenuClick = (e) => {
        if (e.key === "logout") {
            localStorage.removeItem("token");
            window.location.reload();
        } else {
            navigate(`/administrator/${e.key}`);
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

    // Staff Table
    const columns = [
        { title: "ID", dataIndex: "s_id", key: "s_id" },
        { title: "ชื่อ", dataIndex: "s_firstname", key: "s_firstname" },
        { title: "นามสกุล", dataIndex: "s_lastname", key: "s_lastname" },
        { title: "ชื่อผู้ใช้", dataIndex: "s_username", key: "s_username" },
        { title: "เบอร์โทรศัพท์", dataIndex: "s_tel", key: "s_tel" },
        { title: "ตำแหน่งของพนักงาน", dataIndex: "s_position", key: "s_position" },
        { title: "เข้าสู่ระบบล่าสุด", dataIndex: "s_lastlogin", key: "s_lastlogin" , 
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
                    defaultSelectedKeys={["staffs"]}
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
                        <Breadcrumb.Item>จัดการข้อมูลพนักงาน</Breadcrumb.Item>
                    </Breadcrumb>

                    <h2> <TeamOutlined /> ข้อมูลพนักงานในระบบ</h2>

                    <Space style={{ marginBottom: 16 }}>
                        <Button type="primary" onClick={openModal}><PlusSquareOutlined /> เพิ่มพนักงาน</Button>
                    </Space>
    
                    <p>
                        <Table
                            columns={columns}
                            dataSource={staffs}
                            rowKey="s_id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </p>

                    {/* Modal */}
                    <Modal
                        title="เพิ่มพนักงานใหม่"
                        open={isModalOpen}
                        onOk={addStaff}
                        onCancel={closeModal}
                        okText="บันทึก"
                        cancelText="ยกเลิก"
                    >
                        <Form form={form} layout="vertical">
                            <Form.Item name="firstname" label="ชื่อ" rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="lastname" label="นามสกุล" rules={[{ required: true, message: 'กรุณากรอกนามสกุล' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="phone" label="เบอร์โทรศัพท์" rules={[{ required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="position" label="ตำแหน่งของพนักงาน" rules={[{ required: true, message: 'กรุณาเลือกตำแหน่ง' }]}>
                                <Select placeholder="เลือกตำแหน่ง">
                                    <Option value="QC">QC (ฝ่ายตรวจสอบคุณภาพ)</Option>
                                    <Option value="Warehouse">Warehouse (ฝ่ายการคลัง)</Option>
                                    <Option value="Production">Production (ฝ่ายผลิต)</Option>
                                    <Option value="Sales">Sales (ฝ่ายขาย)</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item name="username" label="ชื่อผู้ใช้ของพนักงาน" rules={[{ required: true, message: 'กรุณากรอก username' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="password" label="รหัสผ่าน" rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}>
                                <Input.Password />
                            </Form.Item>
                        </Form>
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
}

export default AdminStaffManagement;
