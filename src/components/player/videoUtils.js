// Utility functions for video quality options
import CryptoJS from 'crypto-js';

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
    
    const responseData = await streamResponse.json();
    
    if (responseData && responseData.data) {
      const decodedData = atob(responseData.data);
      const encryptedData = JSON.parse(decodedData);
      
      const decryptedData = decryptWithPassword(encryptedData);
      const streamData = JSON.parse(decryptedData);
      

      if (!streamData || !streamData.url) {
        throw new Error('No streaming source found');
      }
      
      return streamData;
    } else {
      if (!responseData || !responseData.url) {
        throw new Error('No streaming source found');
      }
      
      return responseData;
    }
  } catch (error) {
    console.error('Error fetching VidSrc content:', error);
    throw error;
  }
}

function decryptWithPassword(e) {
  let t = CryptoJS.enc.Hex.parse(e.salt),
      a = CryptoJS.enc.Hex.parse(e.iv),
      n = e.encryptedData,
      l = CryptoJS.PBKDF2(e.key, t, {
        keySize: 8,
        iterations: e.iterations,
        hasher: CryptoJS.algo.SHA256
      }),
      o = CryptoJS.AES.decrypt(n, l, {
        iv: a,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      }).toString(CryptoJS.enc.Utf8);
  
  return o;
}