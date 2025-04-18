
export function saveProgress(progressData) {
  try {
    let continueData = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
    
    const existingIndex = continueData.findIndex(item => 
      item.id === progressData.id && 
      item.mediaType === progressData.mediaType &&
      (progressData.mediaType === 'movie' || 
       (item.season === progressData.season && item.episode === progressData.episode))
    );
    
    if (existingIndex >= 0) {
      continueData[existingIndex] = progressData;
    } else {
      continueData.push(progressData);
    }
    
    if (continueData.length > 50) {
      continueData = continueData.slice(-50);
    }
    
    localStorage.setItem('quickwatch-continue', JSON.stringify(continueData));
    
    if (progressData.mediaType === 'tv') {
      const oldKey = `tv-progress-${progressData.id}`;
      if (localStorage.getItem(oldKey)) {
        localStorage.removeItem(oldKey);
      }
    }
    
    console.log('Progress saved:', progressData);
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

export function getProgress(mediaId, mediaType, season = 0, episode = 0) {
  try {
    const continueData = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
    console.log('continueData:', continueData);
    
    return continueData.find(item => 
      item.id ===parseInt(mediaId) && 
      item.mediaType === String(mediaType) &&
      (mediaType === 'movie' || 
       (item.season === parseInt(season) && item.episode === parseInt(episode)))
    ) || null;
  } catch (error) {
    console.error('Error getting progress:', error);
    return null;
  }
}

export function getAllProgress(mediaId, mediaType) {
  try {
    const continueData = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
    
    return continueData.filter(item => 
      item.id === mediaId && 
      item.mediaType === mediaType
    );
  } catch (error) {
    console.error('Error getting all progress:', error);
    return [];
  }
}