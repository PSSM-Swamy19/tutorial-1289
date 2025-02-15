const express = require('express')
const app = express()
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'moviesData.db')

app.use(express.json())

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running at http://localhost/3000')
    })
  } catch (e) {
    console.log(`DB Error ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

app.get('/movies/', async (request, response) => {
  const getMoviesNames = `
    select movie_name as movieName
    from 
      movie;
  `
  response.send(await db.all(getMoviesNames))
})

app.post('/movies/', async (request, response) => {
  const moviesDetails = request.body
  const {directorId, movieName, leadActor} = moviesDetails
  const uploadMovieDetails = `
    insert into movie
    (
      director_id,movie_name,lead_actor
    )
    values (
      ${directorId},
      '${movieName}',
      '${leadActor}'
    );
  `
  const dbResponse = await db.run(uploadMovieDetails)
  const movieId = dbResponse.lastID
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieDetails = `
    select 
    movie_id as movieId,
    director_id as directorId,
    movie_name as movieName,
    lead_actor as leadActor
    from movie
    where movie_id = ${movieId};
  `
  const dbResponse = await db.get(getMovieDetails)
  response.send(dbResponse)
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const bookDetails = request.body
  const {directorId, movieName, leadActor} = bookDetails
  const addNewBook = `
    update movie 
    set 
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
    where movie_id = ${movieId}
  `
  const dbResponse = await db.run(addNewBook)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `
   delete from movie where movie_id = ${movieId};
  `
  const dbResponse = await db.run(deleteQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getDirectors = `
    select director_id as directorId,
    director_name as directorName
    from director;
  `
  response.send(await db.all(getDirectors))
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMoviesNames = `
    select movie_name as movieName from movie where director_id = ${directorId}
  `
  response.send(await db.all(getMoviesNames))
})

module.exports = app
