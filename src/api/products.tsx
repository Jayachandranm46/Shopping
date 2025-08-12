const BASE_URL = "https://dummyjson.com";

export const fetchProductsFromApi = async (limit = 20, skip = 0) => {
  const url = `${BASE_URL}/products?limit=${limit}&skip=${skip}`;
  console.log("Fetching products from:", url);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API fetch failed with status: ${res.status}`);
    }
    const json = await res.json();
    return json;  
  } catch (error) {
    console.error("fetchProductsFromApi error:", error);
    throw error;
  }
};


export const fetchProductById = async (id: number) => {
  try {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    if (!res.ok) {
      throw new Error(`API fetch failed with status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("fetchProductById error:", error);
    throw error;
  }
};
