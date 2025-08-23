// src/utils/timeCategories.js

const timeCategories = {
  Peak: {
    startTime: 18, // 6pm
    endTime: 23, // 11pm
    price: 74,
  },
  NonPeak: {
    startTime: 7, // 7am
    endTime: 18, // 6pm
    price: 59,
  },
  Overnight: {
    startTime: 23, // 11pm
    endTime: 7, // 7am
    price: 44,
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

export { timeCategories, getTimeCategoryPrice };