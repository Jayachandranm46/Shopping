import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('products.db');

// Helper function to execute SQL with error handling
const executeSql = async (sql: string, params: any[] = []) => {
  try {
    return await db.execAsync(sql, params);
  } catch (error) {
    console.error(`SQL Error: ${sql}`, error);
    throw error;
  }
};

export const createProductsTable = async () => {
  try {
    await executeSql(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        discountPercentage REAL DEFAULT 0,
        rating REAL DEFAULT 0,
        stock INTEGER DEFAULT 0,
        brand TEXT,
        category TEXT,
        thumbnail TEXT,
        images TEXT
      );
    `);
    console.log('Products table created successfully');
  } catch (error) {
    console.error('Error creating products table:', error);
    throw error;
  }
};

export const saveProductsToDb = async (products: any[]) => {
  try {
    // Use withTransactionAsync for proper transaction management
    await db.withTransactionAsync(async () => {
      // Clear existing products
      await db.runAsync('DELETE FROM products');
      
      // Prepare the insert statement
      const insertStatement = `
        INSERT INTO products (
          id, title, description, price, discountPercentage,
          rating, stock, brand, category, thumbnail, images
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      // Insert all products
      for (const product of products) {
        await db.runAsync(insertStatement, [
          product.id,
          product.title,
          product.description || null,
          product.price,
          product.discountPercentage || 0,
          product.rating || 0,
          product.stock || 0,
          product.brand || null,
          product.category || null,
          product.thumbnail || null,
          JSON.stringify(product.images || [])
        ]);
      }
    });
    
    console.log(`Successfully saved ${products.length} products to database`);
  } catch (error) {
    console.error('Error saving products to database:', error);
    throw error;
  }
};

// Alternative batch insert method for better performance with large datasets
export const saveProductsToDbBatch = async (products: any[]) => {
  try {
    await db.withTransactionAsync(async () => {
      // Clear existing products
      await db.runAsync('DELETE FROM products');
      
      // Prepare batch insert data
      const insertStatement = `
        INSERT INTO products (
          id, title, description, price, discountPercentage,
          rating, stock, brand, category, thumbnail, images
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      // Use prepared statement for better performance
      const statement = await db.prepareAsync(insertStatement);
      
      try {
        for (const product of products) {
          await statement.executeAsync([
            product.id,
            product.title,
            product.description || null,
            product.price,
            product.discountPercentage || 0,
            product.rating || 0,
            product.stock || 0,
            product.brand || null,
            product.category || null,
            product.thumbnail || null,
            JSON.stringify(product.images || [])
          ]);
        }
      } finally {
        await statement.finalizeAsync();
      }
    });
    
    console.log(`Successfully saved ${products.length} products to database (batch)`);
  } catch (error) {
    console.error('Error saving products to database (batch):', error);
    throw error;
  }
};

export const loadProductsFromDb = async () => {
  try {
    const results = await db.getAllAsync<any>('SELECT * FROM products ORDER BY id');
    return results.map(item => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : []
    }));
  } catch (error) {
    console.error('Error loading products from database:', error);
    throw error;
  }
};

// Additional utility functions
export const getProductById = async (id: number) => {
  try {
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM products WHERE id = ?', 
      [id]
    );
    
    if (result) {
      return {
        ...result,
        images: result.images ? JSON.parse(result.images) : []
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting product by id:', error);
    throw error;
  }
};

export const getProductCount = async (): Promise<number> => {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM products'
    );
    return result?.count || 0;
  } catch (error) {
    console.error('Error getting product count:', error);
    throw error;
  }
};

export const clearProductsTable = async () => {
  try {
    await db.runAsync('DELETE FROM products');
    console.log('Products table cleared successfully');
  } catch (error) {
    console.error('Error clearing products table:', error);
    throw error;
  }
};