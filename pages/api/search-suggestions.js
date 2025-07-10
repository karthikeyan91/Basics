export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // In a real implementation, we would search a database or call an external API
    // For this demo, we'll return mock suggestions based on the query
    const suggestions = getMockSuggestions(query);
    
    return res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return res.status(500).json({ 
      error: 'Failed to get search suggestions. Please try again.' 
    });
  }
}

// Get mock search suggestions based on the query
function getMockSuggestions(query) {
  // Common product categories and popular products
  const popularProducts = [
    // Smartphones
    'iPhone 16 Pro', 'iPhone 16', 'iPhone 16 Pro Max', 'iPhone 15', 
    'Samsung Galaxy S24', 'Samsung Galaxy S24 Ultra', 'Samsung Galaxy Z Fold 5',
    'Google Pixel 8', 'Google Pixel 8 Pro', 'OnePlus 12', 'Xiaomi 14 Pro',
    
    // Laptops
    'MacBook Pro', 'MacBook Air', 'Dell XPS 13', 'Dell XPS 15', 
    'HP Spectre x360', 'Lenovo ThinkPad X1', 'Asus ROG Zephyrus',
    'Microsoft Surface Laptop', 'Acer Predator', 'MSI Gaming Laptop',
    
    // Tablets
    'iPad Pro', 'iPad Air', 'iPad Mini', 'Samsung Galaxy Tab S9',
    'Microsoft Surface Pro', 'Lenovo Tab P12 Pro',
    
    // Headphones
    'AirPods Pro', 'AirPods Max', 'Sony WH-1000XM5', 'Bose QuietComfort',
    'JBL Tune', 'Sennheiser Momentum', 'Beats Studio',
    
    // Smartwatches
    'Apple Watch Series 9', 'Apple Watch Ultra', 'Samsung Galaxy Watch 6',
    'Garmin Forerunner', 'Fitbit Sense', 'Amazfit GTR',
    
    // TVs
    'Samsung QLED TV', 'LG OLED TV', 'Sony Bravia', 'TCL Smart TV',
    'Mi TV', 'OnePlus TV', 'Vu Premium TV',
    
    // Cameras
    'Canon EOS', 'Nikon Z', 'Sony Alpha', 'Fujifilm X-T', 'GoPro Hero',
    
    // Gaming
    'PlayStation 5', 'Xbox Series X', 'Nintendo Switch', 'Gaming PC',
    'Gaming Mouse', 'Gaming Keyboard', 'Gaming Headset',
    
    // Home Appliances
    'Refrigerator', 'Washing Machine', 'Air Conditioner', 'Microwave Oven',
    'Air Purifier', 'Water Purifier', 'Vacuum Cleaner'
  ];
  
  // Filter products that match the query (case insensitive)
  const lowerQuery = query.toLowerCase();
  const filteredProducts = popularProducts.filter(product => 
    product.toLowerCase().includes(lowerQuery)
  );
  
  // Sort by relevance (products that start with the query come first)
  filteredProducts.sort((a, b) => {
    const aStartsWith = a.toLowerCase().startsWith(lowerQuery);
    const bStartsWith = b.toLowerCase().startsWith(lowerQuery);
    
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    return 0;
  });
  
  // Limit to 10 suggestions
  return filteredProducts.slice(0, 10);
}