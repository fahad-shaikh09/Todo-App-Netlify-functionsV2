import React from "react"
import { useQuery, useMutation } from '@apollo/client';
import gql from 'graphql-tag';
import "./style.css";

// This query is executed at run time by Apollo.
const GET_TODOS = gql`
{
    todos {
        task,
        id,
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
export default function Home() {
    let inputText;

    const [addTodo] = useMutation(ADD_TODO);
    const addTask = () => {
        addTodo({
            variables: {
                task: inputText.value
            },
            refetchQueries: [{ query: GET_TODOS }]
        })
        inputText.value = "";
    }

    const { loading, error, data } = useQuery(GET_TODOS);
    if (loading)
        return <h2>Loading..</h2>

    if (error) {
        console.log(error)
        return <h2>Error</h2>
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
                    </tr>
                </thead>
                <tbody className="table-body">
                    {data.todos.map(todo => {                        
                        return <tr key={todo.id}>
                            <td> {todo.id} </td>
                            <td> {todo.task} </td>
                            <td> {todo.status.toString()} </td>                            
                        </tr>
                    })}
                </tbody>
            </table>

          {/* <h2>My TODOS</h2>
          {JSON.stringify(data.todos)} */}
        </div>
    );

}