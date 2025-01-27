export const SAMPLE_IMDB_API = `# yaml-language-server: $schema=https://raw.githubusercontent.com/fern-api/fern/main/fern.schema.json

types:
  MovieId: string

  Movie:
    properties:
      id: MovieId
      title: string
      rating: 
        type: double
        docs: The rating scale is one to five stars

  CreateMovieRequest: 
    properties:
      title: string
      rating: double 

services:
  http:
  
    MoviesService:
      auth: false
      base-path: /movies
      endpoints:

        # Here's an HTTP endpoint
        createMovie:
          docs: Add a movie to the database
          method: POST
          path: /create-movie
          request: CreateMovieRequest
          response: MovieId

        getMovie:
          method: GET
          path: /{movieId}
          path-parameters:
            movieId: MovieId
          response: Movie
          errors:
            - MovieDoesNotExistError

errors:
  MovieDoesNotExistError:
    status-code: 404
    type: MovieId
`;
