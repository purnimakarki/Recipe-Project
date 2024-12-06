import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Link } from 'react-router-dom';
import { Table, notification, Button, Popover } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { Container, Row, Col, ListGroup } from 'react-bootstrap';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
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

    fetchData();
  }, []);

  const userColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Popover
          content={`Email: ${record.email}`}
          title={record.name}
          trigger="hover"
        >
          <div>
            <Link to={`/admin/user-details/${record._id}`}>
              <Button type="primary" size="small">View Details</Button>
            </Link>
          </div>
        </Popover>
      ),
    },
  ];

  const recipeColumns = [
    {
      title: 'Image',
      dataIndex: 'recipeImg',
      key: 'recipeImg',
      render: (text, record) => (
        <Popover
          content={<img src={record.recipeImg} alt={record.title} style={{ width: '200px', height: '200px', objectFit: 'cover' }} />}
          title={record.title}
          trigger="hover"
        >
          <img
            src={record.recipeImg}
            alt={record.title}
            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
          />
        </Popover>
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
      render: (text, record) => (
        <Popover
          content={`View details of ${record.title}`}
          title={record.title}
          trigger="hover"
        >
          <div>
            <Link to={`/recipes/${record._id}`}>
              <Button type="primary" style={{ marginRight: 8 }}>
                <EyeOutlined style={{ marginRight: 4 }} />
                View Details
              </Button>
            </Link>
          </div>
        </Popover>
      ),
    },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Inline CSS styles
  const dashboardStyle = {
    backgroundColor: '#000',
    color: '#fff',
    minHeight: '100vh',
    padding: '0',
  };

  const sidebarStyle = {
    backgroundColor: '#222',
    borderRight: '1px solid #444',
    height: '100vh',
    padding: '1rem',
  };

  const contentStyle = {
    padding: '2rem',
    backgroundColor: '#333',
    color: '#fff',
    minHeight: '100vh',
  };

  const listGroupItemStyle = {
    cursor: 'pointer',
    marginBottom: '0.5rem',
    border: '1px solid transparent',
    borderRadius: '0.25rem',
    padding: '0.75rem 1.25rem',
    transition: 'background-color 0.2s ease-in-out',
  };

  const activeItemStyle = {
    backgroundColor: '#007bff',
    color: '#fff',
    borderColor: '#007bff',
  };

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
    </div>
  );
};

export default AdminDashboard;