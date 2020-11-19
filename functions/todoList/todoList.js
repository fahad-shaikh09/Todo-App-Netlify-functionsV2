const { ApolloServer, gql } = require('apollo-server-lambda')
var faunadb = require('faunadb'),
  q = faunadb.query;

const typeDefs = gql`
  type Query {
    todos: [Todo!]    
  }
  type Mutation {
    addTodo(task: String!) : Todo    
  }  
  type Todo {
    id: ID!
    task: String!
    status: Boolean!
  }
`
const resolvers = {
  Query: {
    todos: async (root, args, context) => {
      try {
        var adminClient = new faunadb.Client({ secret: process.env.FAUNADB_SERVER_SECRET });

        const result = await adminClient.query(
          q.Map(
            q.Paginate(q.Match(q.Index('task'))),
            q.Lambda(x => q.Get(x))
          )
        )
        console.log("Result", result.data)
        return result.data.map(d => {
          return {
            id: d.ts,
            status: d.data.status,
            task: d.data.task
          }
        })        
      }
      catch (err) {
        console.log(err)
      }
    }    
  },
  Mutation: {
    addTodo: async (_, { task }) => {
      try {
        var adminClient = new faunadb.Client({ secret: process.env.FAUNADB_SERVER_SECRET });
        const result = await adminClient.query(
          q.Create(
            q.Collection('todos'),
            {
              data: {
                task: task,
                status: true
              }
            },
          )
        )
        return result.ref.data;
      }
      catch (err) {
        console.log(err)
      }
    }
  },  
}


const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const handler = server.createHandler()

module.exports = { handler }
