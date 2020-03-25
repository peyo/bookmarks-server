const express = require("express");
const logger = require("../logger");
const { v4: uuidv4 } = require("uuid");
const { bookmarks } = require("../store");

const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
  .route("/bookmarks")
  .get((req, res) => {
    return res.json(bookmarks)
  })
  .post(bodyParser, (req, res) => {
    const { title, url, description, rating } = req.body;

    if (!title) {
      logger.error(`Title is required.`);
      return res.status(400).send("Title required.");
    }

    if (!url) {
      logger.error(`URL is required.`);
      return res.status(400).send("URL required.")
    }

    if (!description) {
      logger.error(`Description is required.`);
      return res.status(400).send("Description required.")
    }

    const id = uuidv4();

    const bookmark = {
      id,
      title,
      url,
      description,
      rating
    }

    bookmarks.push(bookmark);

    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(bookmark)
  });

bookmarkRouter
  .route("/bookmarks/:id")
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(b => b.id == id);

    if (!bookmark) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res
        .status(404)
        .send("Bookmark not found.");
    }

    res.json(bookmark);
  })
  .delete ((req, res) => {
    const { id } = req.params;

    const bookmarkIndex = bookmarks.findIndex(b => b.id === id);

    if (bookmarkIndex === -1) {
      logger.error(`Specific bookmark not found.`);
      return res
        .status(404)
        .send("Not found.");
    }

    // filter bookmark from bookmarks that does not include id
    bookmarks.forEach(bookmark => {
      const bookmarkId = bookmark.id.filter(bid => bid !== id);
      bookmark.id = bookmarkId;
    });

    bookmarks.splice(bookmarkIndex, 1);

    logger.info(`Bookmark with id ${id} deleted.`)

    res
      .status(204)
      .end();
  });

module.exports = bookmarkRouter;