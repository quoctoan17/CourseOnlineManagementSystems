// controllers/youtubeController.js
import axios from 'axios';

function parseISO8601(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || 0) * 3600)
       + (parseInt(m[2] || 0) * 60)
       +  parseInt(m[3] || 0);
}

export const getVideoInfo = async (req, res) => {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: 'Thiếu videoId' });

  try {
    const { data } = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          part: 'snippet,contentDetails',
          id: videoId,
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    if (!data.items?.length)
      return res.status(404).json({ error: 'Không tìm thấy video' });

    const item = data.items[0];
    res.json({
      title:            item.snippet.title,
      duration_seconds: parseISO8601(item.contentDetails.duration),
      videoId,
    });
  } catch (err) {
    console.error('YouTube API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Lỗi khi gọi YouTube API' });
  }
};