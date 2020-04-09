INSERT INTO bookmarks (id, title, url, rating)
VALUES
  (911, 'Injection post!',
    '<a href="https://www.urldoesnotexist.com" onerror="alert(document.cookie); alert(''you just got pretend hacked!'');">. Execute <strong>malicious JavaScript</strong> when link is clicked.',
    5);