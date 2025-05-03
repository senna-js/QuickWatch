// Utility functions for video quality options

export async function fetchKwikVideoUrl(kwikLink) {
  try {
    const response = await fetch('https://access-kwik.apex-cloud.workers.dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "service": "kwik",
        "action": "fetch",
        "content": {
          "kwik": kwikLink
        },
        "auth": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.O0FKaqhJjEZgCAVfZoLz6Pjd7Gs9Kv6qi0P8RyATjaE"
      })
    });

    const data = await response.json();

    if (data.status && data.content && data.content.url) {
      return data.content.url;
    } else {
      console.error('Invalid response from Kwik API:', data);
      return null;
    }
  } catch (error) {
    console.error('Error fetching video URL:', error);
    return null;
  }
}

export async function fetchVidSrcContent(id, episode, season, type) {
  try {
    let apiUrl;
    if (type === 'movie') {
      apiUrl = `https://player.vidsrc.co/api/server?id=${id}&sr=1`;
    } else {
      apiUrl = `https://player.vidsrc.co/api/server?id=${id}&sr=1&ep=${episode}&ss=${season}`;
    }
    
    const streamResponse = await fetch('https://varunaditya.xyz/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: apiUrl,
        method: 'GET'
      })
    });
    
    const streamData = await streamResponse.json();
    
    if (!streamData || !streamData.url) {
      throw new Error('No streaming source found');
    }
    
    return streamData;
  } catch (error) {
    console.error('Error fetching VidSrc content:', error);
    throw error;
  }
}