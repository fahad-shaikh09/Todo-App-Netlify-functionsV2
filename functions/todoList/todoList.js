const { ApolloServer, gql } = require('apollo-server-lambda')
var faunadb = require('faunadb'),
  q = faunadb.query;

require("dotenv").config();

// The following are the "Schema" definition
const typeDefs = gql`
  type Query {
    todosashraf: [Todo!]    
  }
  type Mutation {
    addTodo(task: String!): Todo   
    delTask(id: ID!): Todo 
  }  
  type Todo {
    id: ID!
    task: String!
    status: Boolean!
  }
`

// const client = new faunadb.Client({
//   secret: process.env.FAUNADB_SERVER_SECRET,
// })

const resolvers = {
  Query: {
    todosashraf: async (root, args, context) => {
      try {
        var adminClient = new faunadb.Client({ secret: "fnAD7e55BbACAEsCKlLpH9oM1kSN77FzDCQ-0Utr" });

        const result = await adminClient.query(
          q.Map(
            q.Paginate(q.Match(q.Index('task'))),
            q.Lambda(x => q.Get(x))
          )
        )
        console.log("Result", result.data)
        return result.data.map(d => {
          return {
            id: d.ref.id,
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
        var adminClient = new faunadb.Client({ secret: "fnAD7e55BbACAEsCKlLpH9oM1kSN77FzDCQ-0Utr" });
        const result = await adminClient.query(
          q.Create(
            q.Collection('todosashraf'),
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
    },
    delTask: async (_, { id }) => {
      try {
        var adminClient = new faunadb.Client({ secret: "fnAD7e55BbACAEsCKlLpH9oM1kSN77FzDCQ-0Utr" });
        // const newId = JSON.stringify(id)
        // console.log("ts ID in DelTask Mutation************", newId)
        console.log("ts ID in DelTask Mutation************", id)

        
        const result = await adminClient.query(        
          q.Delete(q.Ref(q.Collection("todosashraf"), id))
          )
          console.log("result.ref.id in DelTask Mutation************", result.ref.id)
        return result.data
      } catch(error) {console.log(error)}
    }
  }
}


const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const handler = server.createHandler()

module.exports = { handler }
