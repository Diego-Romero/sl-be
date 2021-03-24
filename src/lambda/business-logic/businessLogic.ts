import { TodoItem } from '../../models/TodoItem';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import * as uuid from 'uuid'
import { getUserId } from '../utils';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { TodoItemAccess } from '../todoAccess';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { List, ListItem } from '../../models/type';
import { ListAccess } from '../listAccess';
import { CreateListRequest } from '../../requests/CreateListRequest';
import { CreateListItemRequest } from '../../requests/CreateListItemRequest';
const todoAccess = new TodoItemAccess()
const listAccess = new ListAccess();

export async function createList(
  event: APIGatewayProxyEvent
): Promise<List> {
  const newListItem: CreateListRequest = JSON.parse(event.body);
  const listId = uuid.v4();
  const userId = getUserId(event);

  const item: List = {
    ...newListItem,
    createdAt: new Date().toISOString(),
    listId,
    userId
  };

  await listAccess.createList(item); // data access layer

  return item;
}

export async function createListItem(event: APIGatewayProxyEvent): Promise<ListItem> {
  const newListItem: CreateListItemRequest = JSON.parse(event.body);
  const listId = event.pathParameters.listId;
  const itemId = uuid.v4();

  const item: ListItem = {
    ...newListItem,
    createdAt: new Date().toISOString(),
    itemId,
    listId,
  };

  await listAccess.createListItem(item); // data access layer

  return item;
}

export async function createTodo(event: APIGatewayProxyEvent): Promise<TodoItem> {
  const newTodoItem: CreateTodoRequest = JSON.parse(event.body)
  const id = uuid.v4();
  const userId = getUserId(event);
  
  const fullTodoItem: TodoItem = {
    ...newTodoItem,
    createdAt: new Date().toISOString(),
    done: false,
    todoId: id,
    userId
  }

  await todoAccess.createTodo(fullTodoItem) // data access layer

  return fullTodoItem;
}

export async function deleteTodo(event: APIGatewayProxyEvent) {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event);
  await todoAccess.deleteTodo(todoId, userId);
}

export async function deleteListItem(event: APIGatewayProxyEvent) {
  const itemId = event.pathParameters.itemId;
  const listId = event.pathParameters.listId;
  await listAccess.deleteItem(itemId, listId)
}

export async function getTodos(event: APIGatewayProxyEvent) {
  const userId = getUserId(event);
  const allTodos = await todoAccess.getTodos(userId);
  return allTodos;
} 

export async function getLists(event: APIGatewayProxyEvent) {
  const userId = getUserId(event);
  const lists = await listAccess.getLists(userId);
  return lists;
} 

export async function getList(event: APIGatewayProxyEvent) {
  const listId = event.pathParameters.listId;
  const lists = await listAccess.getList(listId);
  return lists;
} 

export async function updateTodo(event: APIGatewayProxyEvent) {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event);
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const fullTodoItem =  await todoAccess.updateTodo(todoId, userId, updatedTodo);
  return fullTodoItem;
} 

export async function updateItemAttachment(event: APIGatewayProxyEvent) {
  const itemId = event.pathParameters.itemId
  const listId = event.pathParameters.listId
  return await listAccess.updateItemAttachment(itemId, listId );
} 

