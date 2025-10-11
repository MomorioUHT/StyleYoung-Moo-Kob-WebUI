import { useState, useEffect } from "react";
import api from "../../middleware/axios";
import { useNavigate } from "react-router-dom";
import { 
    errorNotification,
    warningNotification,
    successNotification,
} from "../../middleware/displayer";

import { 
    Layout, Menu, Breadcrumb, Avatar, Dropdown, theme, Space, Card, Spin, Select, Modal, 
    InputNumber, Button, Table 
} from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    DashboardOutlined,
    LogoutOutlined,
    UnorderedListOutlined,
    ThunderboltOutlined
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Option } = Select;

function QCDashboard() {
    const navigate = useNavigate();
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const [qcModalVisible, setQcModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const [qcRecords, setQcRecords] = useState([]);

    const {
        token: { colorBgContainer },
    } = theme.useToken();

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

    const fetchZeroGradeProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/zeroGradeProducts", {
                headers: { "api-key": API_KEY },
            });

            const products = res.data || [];
            const formatted = products.map(p => ({
                key: p.p_id,
                p_id: p.p_id,
                p_name: p.p_name,
                qc_grade: null,
                remain_amount: p.p_quantity,
                qc_amount: 0,
            }));

            setQcRecords(formatted);
        } catch (err) {
            console.error(err);
            errorNotification("โหลดข้อมูลไม่สำเร็จ", "ไม่สามารถดึงสินค้าสำหรับ QC ได้");
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
            navigate(`/qc/${e.key}`);
        }
    };

    const userMenuItems = [{ key: "logout", icon: <LogoutOutlined />, label: "Logout" }];

    const openQCModal = async () => {
        await fetchZeroGradeProducts();
        setQcModalVisible(true);
    };

    const handleQCChange = (key, field, value) => {
        setQcRecords(prev =>
            prev.map(r => (r.key === key ? { ...r, [field]: value } : r))
        );
    };

    const handleQC = async (record) => {
        if (!record.qc_grade || record.qc_amount <= 0) {
            warningNotification("ข้อมูลไม่ครบ", "กรุณาเลือกเกรดและจำนวนให้ถูกต้อง");
            return;
        }

        if (record.qc_amount > record.remain_amount) {
            warningNotification(
                "จำนวนไม่ถูกต้อง",
                "ไม่สามารถ QC ได้มากกว่าคงเหลือในระบบ"
            );
            return;
        }

        const payload = {
            staff_id: userInfo?.s_id,
            product_id: record.p_id,
            qc_grade: record.qc_grade,
            qc_quantity: record.qc_amount,
        };

        try {
            setLoading(true);
            await api.post("/createQCLogs", payload, {
                headers: { "api-key": API_KEY },
            });

            successNotification("สำเร็จ", `QC สินค้า ${record.p_name} เรียบร้อย`);
            await fetchZeroGradeProducts();
        } catch (err) {
            console.error(err);
            errorNotification("ผิดพลาด", "ไม่สามารถบันทึกผลการ QC ได้");
        } finally {
            setLoading(false);
        }
    };

    const qcColumns = [
        {
            title: "ชื่อสินค้า",
            dataIndex: "p_name",
            key: "p_name",
        },
        {
            title: "เกรดสินค้า",
            dataIndex: "qc_grade",
            key: "qc_grade",
            render: (_, record) => (
                <Select
                    style={{ width: 220 }}
                    placeholder="เลือกเกรด"
                    value={record.qc_grade}
                    onChange={(val) => handleQCChange(record.key, "qc_grade", val)}
                >
                    <Option value={1}>1 - เกรดสำหรับขายลูกค้า</Option>
                    <Option value={2}>2 - เกรดสำหรับขายร้านอาหาร</Option>
                </Select>
            ),
        },
        {
            title: "คงเหลือในระบบ (หน่วย)",
            dataIndex: "remain_amount",
            key: "remain_amount",
            render: (val) => <span>{val ?? 0}</span>,
        },
        {
            title: "จำนวนที่ต้องการ QC",
            dataIndex: "qc_amount",
            key: "qc_amount",
            render: (_, record) => (
                <InputNumber
                    min={1}
                    value={record.qc_amount}
                    onChange={(val) => handleQCChange(record.key, "qc_amount", val)}
                />
            ),
        },
        {
            title: "ดำเนินการ",
            key: "action",
            render: (_, record) => (
                <Button type="primary" onClick={() => handleQC(record)}>
                    QC สินค้านี้
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
                    <span>{collapsed ? "QC" : "QC Panel"}</span>
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={["dashboard"]}
                    items={[
                        { key: "dashboard", icon: <DashboardOutlined />, label: "หน้าหลัก" },
                        { key: "qclogs", icon: <UnorderedListOutlined />, label: "ประวัติการ QC" }
                    ]}
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
                        <Breadcrumb.Item>QC</Breadcrumb.Item>
                        <Breadcrumb.Item>หน้าหลัก</Breadcrumb.Item>
                    </Breadcrumb>

                    <h2>
                        <ThunderboltOutlined /> หน้าหลักฝ่ายการตรวจสอบคุณภาพ
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
                            onClick={openQCModal}
                        >
                            <div style={{ fontSize: 50, color: "#1677ff", marginTop: 20 }}>
                                <ThunderboltOutlined />
                            </div>
                            <h3 style={{ marginTop: 20 }}>QC สินค้า</h3>
                        </Card>
                    </div>

                    {/* QC Modal */}
                    <Modal
                        title="ตรวจสอบคุณภาพสินค้า (QC)"
                        open={qcModalVisible}
                        onCancel={() => setQcModalVisible(false)}
                        width={900}
                        footer={null}
                    >
                        {loading ? (
                            <Spin />
                        ) : (
                            <Table
                                dataSource={qcRecords}
                                columns={qcColumns}
                                pagination={false}
                            />
                        )}
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
}

export default QCDashboard;
