const express = require('express')
const expressGraphQL = require('express-graphql')

const directors = [
  { id: 1, name: 'Christopher Nolan' },
  { id: 2, name: 'Peter Hunt' },
  { id: 3, name: 'Jackie Chan' }
];
const movies = [
  { id: 1, name: 'Inception', directorId: 1 },
  { id: 2, name: 'James Bond', directorId: 2 },
  { id: 3, name: 'Who Am I', directorId: 3 },
  { id: 4, name: 'Police Story', directorId: 3 },
  { id: 5, name: 'Dark Knight', directorId: 1 },
  { id: 6, name: 'InterStellar', directorId: 1 },
  { id: 7, name: 'Crime Story', directorId: 3 },
  { id: 8, name: 'Rush Hour', directorId: 3 }
];

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql')

const app = express()

//queries: movies, directors
// mutations: addMovie,addDirector

//Types
//movie => id, name, directorId,director
//director=> id,name, movies
const MovieType = new GraphQLObjectType({
  name: 'Movie',
  description: 'Movie filmed by director',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    directorId: { type: GraphQLNonNull(GraphQLInt) },
    director: {
      type: DirectorType,
      resolve: (movie) => {
        return directors.find((director) => director.id === movie.directorId);
      }
    }
  })
});



const DirectorType = new GraphQLObjectType({
  name: 'Director',
  description: 'This represents a director of a movie',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    movies: {
      type: new GraphQLList(MovieType),
      resolve: (author) => {
        return movies.filter((movie) => movie.authorId === author.id);
      }
    }
  })
});

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    movie:{
      type: MovieType,
      description: 'A Single Movie',
      args:{
        id:{ type: GraphQLInt}
      },
      resolve: (parent,args)=> movies.find(movie => movie.id===args.id)
    },
    director:{
      type: DirectorType,
      description:'A Single Director',
      args:{ 
        id: {type: GraphQLInt}
      },
      resolve: (parent,args)=> director.find(director => director.id===args.id)
    },
    movies: {
      type: new GraphQLList(MovieType),
      description: 'List of All Movies',
      resolve: () => movies
    },
    directors: {
      type: new GraphQLList(DirectorType),
      description: 'List of Directors',
      resolve: () => directors
    }
  })
});

const RootMutationType =new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addMovie:{ 
      type: MovieType,
      description: 'Add a movie',
      args:{ 
        name:{ type: GraphQLNonNull(GraphQLString)},
        directorId: { type: GraphQLNonNull(GraphQLInt)}
      },
      resolve: (parent,args) =>{
        const movie ={id: movies.length+1,name: args.name,directorId: args.directorId}
        movies.push(movie)
        return movie
      }
    },
    addDirector:{ 
      type: DirectorType,
      description: 'Add a director',
      args:{ 
        name: { type: GraphQLNonNull(GraphQLString)}
      },
      resolve: (parent,args) =>{
        const director ={id: directors.length+1,name: args.name}
        directors.push(director)
        return director 
      }
    }
  })
})
//
// mutation{
//   addDirector(name:"Tim"){
//   id
// }
// }
// mutation{
//   addMovie(directorId:9,name:"SJK"){
//   id,name
// }
// }


const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});
app.use(
  '/graphql',
  expressGraphQL({
    schema: schema,
    graphiql: true
  })
);
app.listen(5000, () => console.log('Server up and running....'));
