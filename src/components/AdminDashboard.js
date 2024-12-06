import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Link } from 'react-router-dom';
import { Table, notification, Button, Popover, Modal, Form, Input } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Container, Row, Col, ListGroup } from 'react-bootstrap';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersResponse = await axiosInstance.get('/users');
      const recipesResponse = await axiosInstance.get('/recipe');
      setUsers(usersResponse.data);
      setRecipes(recipesResponse.data);
    } catch (error) {
      notification.error({ message: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    try {
      await axiosInstance.delete(`/${type}/${id}`);
      notification.success({ message: `${type.slice(0, -1)} deleted successfully` });
      fetchData();
    } catch (error) {
      notification.error({ message: `Failed to delete ${type.slice(0, -1)}` });
    }
  };

  const showModal = (type, record = null) => {
    setModalType(type);
    setIsModalVisible(true);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (modalType.includes('Edit')) {
        await axiosInstance.put(`/${modalType.split(' ')[1].toLowerCase()}s/${values._id}`, values);
      } else {
        await axiosInstance.post(`/${modalType.toLowerCase()}s`, values);
      }
      setIsModalVisible(false);
      notification.success({ message: `${modalType} successful` });
      fetchData();
    } catch (error) {
      notification.error({ message: `Failed to ${modalType.toLowerCase()}` });
    }
  };

  const userColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button type="primary" onClick={() => showModal('Edit User', record)} icon={<EditOutlined />} style={{ marginRight: 8 }} />
          <Button type="danger" onClick={() => handleDelete(record._id, 'users')} icon={<DeleteOutlined />} />
        </>
      ),
    },
  ];

  const recipeColumns = [
    {
      title: 'Image',
      dataIndex: 'recipeImg',
      key: 'recipeImg',
      render: (text, record) => (
        <img src={record.recipeImg} alt={record.title} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
      ),
    },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Created By',
      dataIndex: 'creator',
      key: 'creator',
      render: (creator) => creator?.name || 'Unknown',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button type="primary" onClick={() => showModal('Edit Recipe', record)} icon={<EditOutlined />} style={{ marginRight: 8 }} />
          <Button type="danger" onClick={() => handleDelete(record._id, 'recipes')} icon={<DeleteOutlined />} />
        </>
      ),
    },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // ... (keep your existing styles)

  return (
    <div style={dashboardStyle}>
      <Container fluid>
        <Row>
          <Col md={3} style={sidebarStyle}>
            <h4>Admin Dashboard</h4>
            <ListGroup>
              <ListGroup.Item
                style={{ ...listGroupItemStyle, ...(activeTab === 'users' ? activeItemStyle : {}) }}
                onClick={() => handleTabChange('users')}
              >
                User Details
              </ListGroup.Item>
              <ListGroup.Item
                style={{ ...listGroupItemStyle, ...(activeTab === 'recipes' ? activeItemStyle : {}) }}
                onClick={() => handleTabChange('recipes')}
              >
                Recipe Details
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={9} style={contentStyle}>
            <div>
              {activeTab === 'users' && (
                <>
                  <h2>User Details</h2>
                  <Button type="primary" onClick={() => showModal('Add User')} icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
                    Add User
                  </Button>
                  <Table
                    columns={userColumns}
                    dataSource={users}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                    style={{ color: '#fff' }}
                  />
                </>
              )}
              {activeTab === 'recipes' && (
                <>
                  <h2>Recipe Details</h2>
                  <Button type="primary" onClick={() => showModal('Add Recipe')} icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
                    Add Recipe
                  </Button>
                  <Table
                    columns={recipeColumns}
                    dataSource={recipes}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                    style={{ color: '#fff' }}
                  />
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>
      <Modal
        title={modalType}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          {modalType.includes('User') && (
            <>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
              {modalType === 'Add User' && (
                <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                  <Input.Password />
                </Form.Item>
              )}
            </>
          )}
          {modalType.includes('Recipe') && (
            <>
              <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="recipeImg" label="Image URL" rules={[{ required: true, type: 'url' }]}>
                <Input />
              </Form.Item>
              {/* Add more recipe fields as needed */}
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
