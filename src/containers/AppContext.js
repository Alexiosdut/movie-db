import React, { Component, createContext } from "react";
import axios from "axios";

const AppContext = createContext();

export class AppProvider extends Component {
  state = {
    movies: [],
    moviesPage: 1,
    heroMovies: [],
    genres: [],
    moviesLoaded: true
  };

  getGenres = async () => {
    const res = await axios.get(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${
        process.env.REACT_APP_API_KEY
      }&language=en-US`
    );

    const genres = await res.data.genres;

    return this.setState({ ...this.state, genres });
  };

  getMoviePage = async page => {
    const res = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${
        process.env.REACT_APP_API_KEY
      }&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}`
    );

    return await res.data;
  };

  getMovies = async () => {
    const { results: movies, page: moviesPage } = await this.getMoviePage(1);

    setTimeout(() => {
      this.setState({
        ...this.state,
        movies,
        moviesPage,
        heroMovies: movies.filter((movie, index) => index < 3)
      });
    }, 1000);
  };

  getNextMoviesPage = async page => {
    const { results: newPage, page: nextPage } = await this.getMoviePage(page);
    setTimeout(() => {
      this.setState({
        ...this.state,
        movies: [...this.state.movies, ...newPage],
        moviesPage: nextPage,
        moviesLoaded: true
      });
    }, 1000);
  };

  componentDidMount() {
    this.getGenres();
    this.getMovies();
  }

  getMovieGenres = movie =>
    [].concat.apply(
      [],
      movie.genre_ids.map(id =>
        this.state.genres.filter(genre => genre.id === id && genre.name)
      )
    );

  notMoviesLoaded = () => this.setState({ moviesLoaded: false });

  render() {
    return (
      <AppContext.Provider
        value={{
          heroMovies: this.state.heroMovies,
          movies: this.state.movies,
          getMovieGenres: this.getMovieGenres,
          getNextMoviesPage: this.getNextMoviesPage,
          moviesPage: this.state.moviesPage,
          notMoviesLoaded: this.notMoviesLoaded,
          moviesLoaded: this.state.moviesLoaded
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}

export const Consumer = AppContext.Consumer;
