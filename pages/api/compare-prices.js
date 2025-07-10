export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, url } = req.query;

  // Support both query and url parameters for backward compatibility
  if (!query && !url) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    let productName;
    let platform = null;

    if (query) {
      // Direct product search
      productName = query;
    } else if (url) {
      // Legacy URL-based search
      if (!isValidEcommerceUrl(url)) {
        return res.status(400).json({ 
          error: 'Invalid URL. Please provide a URL from Amazon India, Flipkart, or other supported Indian e-commerce sites.' 
        });
      }

      // Extract product information from the URL
      const productInfo = extractProductInfo(url);
      productName = productInfo.productName;
      platform = productInfo.platform;
    }

    // In a real implementation, we would search for the product on other platforms
    // For this demo, we'll return mock data based on the product name
    const comparisonResults = await getMockComparisonResults(productName, platform);

    return res.status(200).json(comparisonResults);
  } catch (error) {
    console.error('Error comparing prices:', error);
    return res.status(500).json({ 
      error: 'Failed to compare prices. Please try again.' 
    });
  }
}

// Check if the URL is from a supported e-commerce site
function isValidEcommerceUrl(url) {
  const supportedDomains = [
    'amazon.in',
    'flipkart.com',
    'myntra.com',
    'snapdeal.com',
    'shopclues.com',
    'tatacliq.com',
    'nykaa.com',
    'ajio.com',
    'reliancedigital.in',
    'croma.com'
  ];

  try {
    const urlObj = new URL(url);
    return supportedDomains.some(domain => urlObj.hostname.includes(domain));
  } catch (e) {
    return false;
  }
}

// Extract product information from the URL
function extractProductInfo(url) {
  // In a real implementation, we would parse the URL to extract product ID, name, etc.
  // For this demo, we'll extract basic information from the URL

  const urlObj = new URL(url);
  const hostname = urlObj.hostname;

  let platform = '';
  if (hostname.includes('amazon.in')) {
    platform = 'Amazon India';
  } else if (hostname.includes('flipkart.com')) {
    platform = 'Flipkart';
  } else if (hostname.includes('myntra.com')) {
    platform = 'Myntra';
  } else if (hostname.includes('snapdeal.com')) {
    platform = 'Snapdeal';
  } else if (hostname.includes('shopclues.com')) {
    platform = 'ShopClues';
  } else if (hostname.includes('tatacliq.com')) {
    platform = 'Tata CLiQ';
  } else if (hostname.includes('nykaa.com')) {
    platform = 'Nykaa';
  } else if (hostname.includes('ajio.com')) {
    platform = 'AJIO';
  } else if (hostname.includes('reliancedigital.in')) {
    platform = 'Reliance Digital';
  } else if (hostname.includes('croma.com')) {
    platform = 'Croma';
  } else {
    platform = 'Unknown';
  }

  // Extract product name from path segments
  const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
  let productName = pathSegments[pathSegments.length - 1] || 'Unknown Product';

  // Clean up the product name
  productName = productName
    .replace(/-/g, ' ')
    .replace(/[0-9a-f]{8,}/i, '') // Remove long hex strings (often IDs)
    .trim();

  // Capitalize first letter of each word
  productName = productName.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    platform,
    productName,
    url
  };
}

// Get mock comparison results
async function getMockComparisonResults(productName, sourcePlatform = null) {
  // In a real implementation, we would search for the product on other platforms
  // For this demo, we'll return mock data

  // Generate a consistent price based on the product name
  const basePrice = getConsistentPrice(productName);

  // List of platforms to include in the comparison
  const allPlatforms = [
    'Amazon India',
    'Flipkart',
    'Myntra',
    'Snapdeal',
    'ShopClues',
    'Tata CLiQ',
    'Nykaa',
    'AJIO',
    'Reliance Digital',
    'Croma'
  ];

  // If we have a source platform, exclude it from the list and add it first
  let platforms = [...allPlatforms];
  let selectedPlatforms = [];

  if (sourcePlatform) {
    platforms = platforms.filter(p => p !== sourcePlatform);

    // Add the source platform first
    const sourceUrl = getMockUrl(sourcePlatform, productName);

    // Format the base price correctly based on whether it has decimal places
    const formattedBasePrice = Number.isInteger(basePrice) 
      ? `₹${basePrice.toLocaleString('en-IN')}` 
      : `₹${basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    selectedPlatforms.push({
      platform: sourcePlatform,
      price: formattedBasePrice,
      name: productName,
      rating: (3 + Math.random() * 2).toFixed(1), // 3.0-5.0
      availability: 'In Stock',
      url: sourceUrl
    });
  }

  // Select 4-6 platforms (or 3-5 if we already have a source platform)
  const numPlatforms = sourcePlatform ? 
    Math.floor(Math.random() * 3) + 3 : // 3-5 additional platforms if we have a source
    Math.floor(Math.random() * 3) + 4;  // 4-6 platforms if no source

  // Add random platforms
  while (selectedPlatforms.length < numPlatforms) {
    const randomIndex = Math.floor(Math.random() * platforms.length);
    const randomPlatform = platforms[randomIndex];

    // Remove the selected platform to avoid duplicates
    platforms.splice(randomIndex, 1);

    // Generate a price variation
    const priceVariation = (Math.random() * 0.3) - 0.15; // -15% to +15%
    const price = Math.round(basePrice * (1 + priceVariation));

    // Generate random availability
    const availabilityOptions = ['In Stock', 'Limited Stock', 'Out of Stock'];
    const availability = availabilityOptions[Math.floor(Math.random() * availabilityOptions.length)];

    // Generate a slightly different product name
    const nameVariations = [
      productName,
      `${productName} (${randomPlatform} Exclusive)`,
      `${productName} - Special Edition`,
      `${productName} (New)`,
      `${productName} (Imported)`
    ];
    const name = nameVariations[Math.floor(Math.random() * nameVariations.length)];

    // Generate a mock URL for the platform
    const mockUrl = getMockUrl(randomPlatform, productName);

    // Format the price correctly based on whether it has decimal places
    const formattedPrice = Number.isInteger(price) 
      ? `₹${price.toLocaleString('en-IN')}` 
      : `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    selectedPlatforms.push({
      platform: randomPlatform,
      price: formattedPrice,
      name,
      rating: (3 + Math.random() * 2).toFixed(1), // 3.0-5.0
      availability,
      url: mockUrl
    });
  }

  // Sort by price (lowest first)
  return selectedPlatforms.sort((a, b) => {
    // Extract numeric value from price string (remove currency symbol and commas)
    const priceA = parseFloat(a.price.replace(/[₹,]/g, ''));
    const priceB = parseFloat(b.price.replace(/[₹,]/g, ''));
    return priceA - priceB;
  });
}

// Generate a consistent price based on the product name
function getConsistentPrice(productName) {
  // Use a simple hash function to generate a consistent price
  let hash = 0;
  for (let i = 0; i < productName.length; i++) {
    hash = ((hash << 5) - hash) + productName.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  // Generate a base price between 500 and 50000
  const basePrice = Math.abs(hash % 49500) + 500;

  // Round to a more realistic price point (ending in 9, 99, etc.)
  if (basePrice > 10000) {
    return Math.floor(basePrice / 100) * 100 - 1; // e.g., 12499, 34999
  } else if (basePrice > 1000) {
    return Math.floor(basePrice / 10) * 10 - 1; // e.g., 1499, 2999
  } else {
    return Math.floor(basePrice / 10) * 10 - 0.01; // e.g., 499.99, 599.99
  }
}

// Generate a mock URL for a platform
function getMockUrl(platform, productName) {
  const slug = productName.toLowerCase().replace(/\s+/g, '-');
  // Generate a consistent product ID based on the product name
  let productId = '';
  for (let i = 0; i < productName.length; i++) {
    productId += productName.charCodeAt(i).toString(16);
  }
  productId = productId.substring(0, 10).toUpperCase();

  switch (platform) {
    case 'Amazon India':
      return `https://www.amazon.in/${slug}/dp/B0${productId.substring(0, 7)}/ref=sr_1_1`;
    case 'Flipkart':
      return `https://www.flipkart.com/${slug}/p/itm${productId.toLowerCase()}`;
    case 'Myntra':
      return `https://www.myntra.com/${slug.split('-').join('/')}/${productId.toLowerCase()}`;
    case 'Snapdeal':
      return `https://www.snapdeal.com/${slug.split('-')[0]}/${slug}/p/${productId.toLowerCase()}`;
    case 'ShopClues':
      return `https://www.shopclues.com/${slug.replace(/-/g, '-')}-${productId.toLowerCase()}.html`;
    case 'Tata CLiQ':
      return `https://www.tatacliq.com/${slug.split('-')[0]}/c-${productId.toLowerCase()}/${slug}`;
    case 'Nykaa':
      return `https://www.nykaa.com/brands/${slug.split('-')[0]}/${slug}/p/${productId.toLowerCase()}`;
    case 'AJIO':
      return `https://www.ajio.com/s/${slug}?query=${encodeURIComponent(productName)}`;
    case 'Reliance Digital':
      return `https://www.reliancedigital.in/${slug}/p/${productId.toLowerCase()}`;
    case 'Croma':
      return `https://www.croma.com/${slug.split('-').join('/')}/p/${productId.toLowerCase()}`;
    default:
      return `https://www.example.com/product/${slug}`;
  }
}
