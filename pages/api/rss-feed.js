import Parser from 'rss-parser';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const parser = new Parser();
    const feed = await parser.parseURL(url);
    
    // Return the feed items
    return res.status(200).json({
      title: feed.title,
      description: feed.description,
      link: feed.link,
      items: feed.items
    });
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    return res.status(500).json({ 
      error: 'Failed to parse the RSS feed. Please check the URL and try again.' 
    });
  }
}