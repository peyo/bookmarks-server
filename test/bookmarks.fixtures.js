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

function makeMaliciousBookmark() {
  const maliciousBookmark = {
    id: 911,
    title: "Malicious bookmark <script>alert('xss');</script>",
    url: `Bad link <a href="https://www.urldoesnotexist.com" onerror="alert(document.cookie);"> But not <strong>all</strong> bad.`,
    rating: 5
  }
  const expectedBookmark = {
    ...maliciousBookmark,
    title: "Malicious bookmark &lt;script&gt;alert(\'xss\');&lt;/script&gt;",
    url: `Bad link <a href="https://www.urldoesnotexist.com"> But not <strong>all</strong> bad.`,
    rating: 5
  }
  return {
    maliciousBookmark,
    expectedBookmark
  }
}

module.exports = {
  makeBookmarksArray,
  makeMaliciousBookmark
};