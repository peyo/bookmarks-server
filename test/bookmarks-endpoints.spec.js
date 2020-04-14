require('dotenv').config();
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray, makeMaliciousBookmark } = require('./bookmarks.fixtures');

describe.only('Bookmarks Endpoints', () => {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  before('clean the table', () => db('bookmarks').truncate())

  afterEach('cleanup', () => db('bookmarks').truncate())

  after('disconnect from db', () => db.destroy())

  describe(`GET /api/bookmarks`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/bookmarks')
          .set("Authorization", "Bearer " + process.env.API_TOKEN)
          .expect(200, [])
      })
    })

    context(`Given there are bookmarks in the database`, () => {
      const testBookmarks = makeBookmarksArray()

      beforeEach('insert articles', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('responds with 200 and all of the articles', () => {
        return supertest(app)
          .get('/api/bookmarks')
          .set("Authorization", "Bearer " + process.env.API_TOKEN)
          .expect(200, testBookmarks)
      })
    })
  })

  describe(`GET /api/bookmarks/:id`, () => {
    context(`Given no bookmark found`, () => {
      it(`responds with 404`, () => {
        const id = 123456
        return supertest(app)
          .get(`/api/bookmarks/${id}`)
          .set("Authorization", "Bearer " + process.env.API_TOKEN)
          .expect(404, { error: { message: `Bookmark doesn't exist` } })
      })
    })

    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray()

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('responds with 200 and the specified bookmark', () => {
        const id = 3
        const expectedBookmark = testBookmarks[id - 1]
        return supertest(app)
          .get(`/api/bookmarks/${id}`)
          .set("Authorization", "Bearer " + process.env.API_TOKEN)
          .expect(200, expectedBookmark)
      })
    })
  })

  describe(`POST /api/bookmarks`, () => {
    it(`creates an bookmark, responding with 201 and the new bookmark`, function () {
      const newBookmark = {
        title: "Rick and Morty",
        url: "https://www.adultswim.com/videos/rick-and-morty",
        description: "Watch ridiculous cartoon",
        rating: 5
      }

      return supertest(app)
        .post('/api/bookmarks')
        .set("Authorization", "Bearer " + process.env.API_TOKEN)
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title)
          expect(res.body.url).to.eql(newBookmark.url)
          expect(res.body.description).to.eql(newBookmark.description)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.endsWith(`/api/bookmarks/${res.body.id}`)
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/bookmarks/${postRes.body.id}`)
            .set("Authorization", "Bearer " + process.env.API_TOKEN)
            .expect(postRes.body)
        )
    })

    const requiredFields = ['title', 'url', 'rating']

    requiredFields.forEach(field => {
      const newBookmark = {
        title: "Bookmark new title",
        url: "https://www.bookmarksaregreat.com",
        rating: 5
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newBookmark[field]

        return supertest(app)
          .post('/api/bookmarks')
          .set("Authorization", "Bearer " + process.env.API_TOKEN)
          .send(newBookmark)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })

      it('removes XSS attack content from response', () => {
        const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()
        return supertest(app)
          .post(`/api/bookmarks`)
          .set("Authorization", "Bearer " + process.env.API_TOKEN)
          .send(maliciousBookmark)
          .expect(201)
          .expect(res => {
            expect(res.body.title).to.eql(expectedBookmark.title)
            expect(res.body.url).to.eql(expectedBookmark.url)
          })
      })
    })
  })

  describe(`DELETE /api/bookmarks/:id`, () => {
    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray()

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('responds with 204 and removes the bookmark', () => {
        const idToRemove = 2
        const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
        return supertest(app)
          .delete(`/api/bookmarks/${idToRemove}`)
          .set("Authorization", "Bearer " + process.env.API_TOKEN)
          .expect(204)
          .then(res => 
            supertest(app)
              .get(`/api/bookmarks`)
              .set("Authorization", "Bearer " + process.env.API_TOKEN)
              .expect(expectedBookmarks)
          )
      })
    })

    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const id = 123456
        return supertest(app)
          .delete(`/api/bookmarks/${id}`)
          .set("Authorization", "Bearer " + process.env.API_TOKEN)
          .expect(404, { error: { message: `Bookmark doesn't exist` } })
      })
    })
  })

  describe.only(`PATCH /api/bookmarks/:id`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const id = 123456;
        return supertest(app)
          .patch(`/api/bookmarks/${id}`)
          .expect(404, { error: { message: `Bookmark doesn't exist` } })
      })
    })

    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray();
      const updatedBookmark = {
        title: "Rick and Morty",
        url: "https://www.adultswim.com/videos/rick-and-morty",
        description: "Watch ridiculous cartoon",
        rating: 5
      }

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('responds with 204 and updates the article', () => {
        const idToUpdate = 2;
        const updateBookmark = updatedBookmark;

        const expectedBookmark = {
          ...testBookmarks[idToUpdate - 1],
          ...updateBookmark
        }
        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .send(updateBookmark)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/bookmarks/${idToUpdate}`)
              .expect(expectedBookmark)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
                message: `Request body must contain either 'title', 'url', 'description', or 'rating'.`
            }
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2;
        const updateBookmark = {
          title: "Rick and Morty",
          url: "https://www.adultswim.com/videos/rick-and-morty",
          rating: 5
        }
        const expectedBookmark = {
          ...testBookmarks[idToUpdate - 1],
          ...updateBookmark
        }

        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .send({
            ...updateBookmark,
            fieldToIgnore: 'should not be in GET responds'
          })
          .expect(204)
          .then(res => 
            supertest(app)
              .get(`/api/bookmarks/${idToUpdate}`)
              .expect(expectedBookmark)
          )
      })
    })
  })
})