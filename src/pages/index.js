import React from "react";
import { useQuery, useMutation } from '@apollo/client';
import gql from 'graphql-tag';
import "./style.css";

// This query is executed at run time by Apollo.
const GET_TODOS = gql`
{
    todos {
        id,
        task,        
        status
    }
}
`;

// This query is for addition of new task
const ADD_TODO = gql`
    mutation addTodo($task: String!){
        addTodo(task: $task){
            task
        }
    }
`

const DELETE_TODOS = gql`
  mutation delTask($id: ID!) {
    delTask(id: $id) {
      task
    }
  }
`

export default function Home() {
    let inputText;
    const { loading, error, data } = useQuery(GET_TODOS);    
    const [deleteTodo] = useMutation(DELETE_TODOS);    
    const [addTodo] = useMutation(ADD_TODO);

    if (loading)
        return <h2>Loading..</h2>

    if (error) {
        console.log(error)
        return <h2>Error</h2>
    }

    const addTask = () => {
        addTodo({
            variables: {
                task: inputText.value
            },
            refetchQueries: [{ query: GET_TODOS }]
        })
        inputText.value = "";
    }

    const handleDelete = event => {
        console.log(event.currentTarget.value)
        deleteTodo({
          variables: {
            id: event.currentTarget.value,
          },
          refetchQueries: [{ query: GET_TODOS }],
        })
      }    

    return (
        <div className="container">
            <label>
                <h1> Add Task </h1> 
                <input type="text" 
                       ref={node => {inputText = node;} } 
                       placeholder="Add task"
                
                />
            </label>
            <button onClick={addTask}> + </button>

            <br /> <br />

            <h2>TODO LIST</h2>          

            <table border="3">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th> TASK </th>
                        <th> STATUS </th> 
                        <th>X</th>                       
                    </tr>
                </thead>
                <tbody className="table-body">
                    {data.todos.map(todo => {                        
                        return <tr key={todo.id}>
                            <td> {todo.id} </td>
                            <td> {todo.task} </td>
                            <td> {todo.status.toString()} </td>  
                            <td><button value={todo.id} onClick={handleDelete}>x</button></td>                          
                        </tr>
                    })}
                </tbody>
            </table>

          {/* <h2>My TODOS</h2>
          {JSON.stringify(data.todos)} */}
        </div>
    );

}