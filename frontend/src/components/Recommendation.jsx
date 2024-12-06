import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Card, Spin, Alert } from 'antd';
import AuthContext from '../context/AuthContext';

const Recommendation = () => {
  const [loading, setLoading] = useState(true);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [error, setError] = useState(null);

  const { userInfo } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userInfo || !userInfo._id) {
        setError('User not found');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching recommendations for user ID:', userInfo._id);

        const response = await axios.get(`http://localhost:5000/api/v1/users/recommendations/${userInfo._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('API Response:', response);

        if (response.headers['content-type'].includes('application/json')) {
          console.log('Response data:', response.data);
          if (Array.isArray(response.data)) {
            const similarityRecipes = response.data.filter(recipe => recipe.recommendedBy === 'similarity');
            const randomRecipes = response.data.filter(recipe => recipe.recommendedBy === 'random');

            const finalRecommendations = [...similarityRecipes];
            const neededCount = 5 - finalRecommendations.length;

            if (neededCount > 0) {
              finalRecommendations.push(...randomRecipes.slice(0, neededCount));
            }

            setRecommendedRecipes(finalRecommendations);
          } else {
            console.warn('Unexpected response format:', response.data);
            setError('Unexpected response format');
          }
        } else {
          console.warn('Unexpected content type:', response.headers['content-type']);
          setError('Unexpected response format');
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err.response ? err.response.data.message : 'Error fetching recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userInfo]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin tip="Loading recommendations...">
          <div style={{ height: '200px' }}></div>
        </Spin>
      </div>
    );
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <h2>Recommended Recipes</h2>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}>
        {recommendedRecipes.length > 0 ? (
          recommendedRecipes.map((recipe) => (
            <Card
              key={recipe._id}
              title={recipe.title}
              cover={<img alt={recipe.title} src={recipe.recipeImg || 'placeholder-image-url'} style={{ height: '200px', objectFit: 'cover' }} />}
              style={{
                width: 'calc(33.33% - 20px)', // Three cards per row with margins
                margin: '10px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ padding: '10px', flexGrow: 1 }}>
                <p>{recipe.description}</p>
                <p><strong>Category:</strong> {recipe.category}</p>
                <p><strong>Cooking Time:</strong> {recipe.cookingTime} mins</p>
                <p><strong>Rating:</strong> {recipe.rating}</p>
                <p><strong>Recommended By:</strong> {recipe.recommendedBy}</p>
              </div>
            </Card>
          ))
        ) : (
          <p>No recommendations available.</p>
        )}
      </div>
    </div>
  );
};

export default Recommendation;
