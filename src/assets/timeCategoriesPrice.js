// src/utils/timeCategories.js

const timeCategories = {
  Peak: {
    startTime: 18, // 6pm
    endTime: 23, // 11pm
    price: 148,
  },
  NonPeak: {
    startTime: 7, // 7am
    endTime: 18, // 6pm
    price: 118,
  },
  Overnight: {
    startTime: 23, // 11pm
    endTime: 7, // 7am
    price: 88,
  },
};

// Function to get the price for a specific time category
const getTimeCategoryPrice = (time) => {
  const hour = parseInt(time.split(':')[0]);
  for (const category in timeCategories) {
    if (category === 'Overnight') {
      if (hour >= timeCategories[category].startTime || hour < timeCategories[category].endTime) {
        return timeCategories[category].price;
      }
    } else {
      if (hour >= timeCategories[category].startTime && hour < timeCategories[category].endTime) {
        return timeCategories[category].price;
      }
    }
  }
  return null;
};

export {getTimeCategoryPrice};