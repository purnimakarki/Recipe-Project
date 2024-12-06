import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';
import { notification, Button, Form, Input, Card, Space, InputNumber } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';

const RecipeEdit = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axiosInstance.get(`/recipe/${recipeId}`);
        setRecipe(response.data);
      } catch (error) {
        notification.error({ message: 'Failed to fetch recipe' });
      }
    };

    fetchRecipe();
  }, [recipeId]);

  const handleSave = async (values) => {
    try {
      await axiosInstance.put(`/recipe/${recipeId}`, values);
      notification.success({ message: 'Recipe updated successfully' });
      navigate('/admin');
    } catch (error) {
      notification.error({ message: 'Failed to update recipe' });
    }
  };

  return recipe ? (
    <div style={{ backgroundColor: '#1e1e1e', minHeight: '100vh', padding: '2rem', color: '#ffffff' }}>
      <Card
        title={<span style={{ color: '#ffcc00', fontSize: '28px', fontWeight: 'bold' }}>Edit Recipe</span>}
        bordered={false}
        style={{
          maxWidth: '800px',
          margin: '2rem auto',
          padding: '2rem',
          backgroundColor: '#2c2c2c',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)',
          borderRadius: '12px',
        }}
      >
        <Form
          initialValues={recipe}
          onFinish={handleSave}
          layout="vertical"
          style={{ width: '100%' }}
        >
          {/* Recipe Title */}
          <Form.Item
            label={<span style={{ color: '#ffcc00' }}>Recipe Title</span>}
            name="title"
            rules={[{ required: true, message: 'Please input the recipe title!' }]}
          >
            <Input
              placeholder="Enter recipe title"
              className="form-control"
              style={{ borderColor: '#ffcc00', color: '#000000', backgroundColor: '#f8f8f8' }}
            />
          </Form.Item>

          {/* Recipe Description */}
          <Form.Item
            label={<span style={{ color: '#ffcc00' }}>Recipe Description</span>}
            name="description"
            rules={[{ required: true, message: 'Please input the recipe description!' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter recipe description"
              className="form-control"
              style={{ borderColor: '#ffcc00', color: '#000000', backgroundColor: '#f8f8f8' }}
            />
          </Form.Item>

          {/* Recipe Image URL */}
          <Form.Item label={<span style={{ color: '#ffcc00' }}>Image URL</span>} name="recipeImg">
            <Input
              placeholder="Enter image URL"
              className="form-control"
              style={{ borderColor: '#ffcc00', color: '#000000', backgroundColor: '#f8f8f8' }}
            />
          </Form.Item>

          {/* Ingredients */}
          <Form.Item
            label={<span style={{ color: '#ffcc00' }}>Ingredients</span>}
            name="ingredients"
            rules={[{ required: true, message: 'Please input the ingredients!' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter ingredients (comma-separated)"
              className="form-control"
              style={{ borderColor: '#ffcc00', color: '#000000', backgroundColor: '#f8f8f8' }}
            />
          </Form.Item>

          {/* Cooking Time */}
          <Form.Item
            label={<span style={{ color: '#ffcc00' }}>Cooking Time (in minutes)</span>}
            name="cookingTime"
            rules={[{ required: true, message: 'Please input the cooking time!' }]}
          >
            <InputNumber
              min={1}
              placeholder="Enter cooking time"
              style={{ width: '100%', borderColor: '#ffcc00', backgroundColor: '#f8f8f8', color: '#000000' }}
              className="form-control"
            />
          </Form.Item>

          {/* Instructions */}
          <Form.Item
            label={<span style={{ color: '#ffcc00' }}>Instructions</span>}
            name="instructions"
            rules={[{ required: true, message: 'Please input the instructions!' }]}
          >
            <Input.TextArea
              rows={6}
              placeholder="Enter cooking instructions"
              className="form-control"
              style={{ borderColor: '#ffcc00', color: '#000000', backgroundColor: '#f8f8f8' }}
            />
          </Form.Item>

          {/* Save and Cancel Buttons */}
          <Space style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <Button
              type="primary"
              htmlType="submit"
              className="btn btn-success"
              style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
            >
              Save Changes
            </Button>
            <Button onClick={() => navigate(-1)} type="default" className="btn btn-secondary">
              Cancel
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  ) : (
    <div style={{ textAlign: 'center', marginTop: '2rem', color: '#ffffff' }}>Loading...</div>
  );
};

export default RecipeEdit;
