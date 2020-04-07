function makeBookmarksArray() {
  return [
    {
      id: 1,
      title: "Thinkful",
      url: "https://www.thinkful.com",
      description: "Learn good stuff",
      rating: 5
    },
    {
      id: 2,
      title: "Google",
      url: "https://www.google.com",
      description: "Search anything",
      rating: 5
    },
    {
      id: 3,
      title: "YouTube",
      url: "https://www.youtube.com",
      description: "Watch stuff",
      rating: 5
    },
    {
      id: 4,
      title: "Facebook",
      url: "https://www.facebook.com",
      description: "Stay connected",
      rating: 3
    }
  ];
}

module.exports = { makeBookmarksArray };