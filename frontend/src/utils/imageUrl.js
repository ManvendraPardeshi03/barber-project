// frontend/src/utils/imageUrl.js

const BASE_API_URL = "https://barber-backend-tmig.onrender.com";

export const getImageUrl = (fileName) => `${BASE_API_URL}/uploads/${fileName}`;
