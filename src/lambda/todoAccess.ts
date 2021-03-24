import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { TodoItem } from '../models/TodoItem';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger';
const logger = createLogger('todos')

export class TodoItemAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODOS_TABLE,
    private readonly index = process.env.INDEX_NAME,
  ) {}

  async createTodo(todo: TodoItem ): Promise<TodoItem> {
    logger.info('creating todo', { key: todo})
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todo
    }).promise()

    return todo
  }

  async updateTodo(todoId: string, userId: string, todoBody: UpdateTodoRequest): Promise<TodoItem> {
    logger.info('updating todo', { key: todoBody})
    const result = await this.docClient.update({
      TableName: this.todoTable,
      Key: {
        todoId,
        userId
      },
      ExpressionAttributeNames: {
        '#todo_name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': todoBody.name,
        ':dueDate': todoBody.dueDate,
        ':done': todoBody.done
      },
      UpdateExpression: 'SET #todo_name = :name, dueDate = :dueDate, done = :done',
      ReturnValues: 'ALL_NEW'
    }).promise();

    logger.info('updated successfully')

    return result.Attributes as TodoItem;
  }

  async deleteTodo(todoId: string, userId: string) {
    logger.info('deleting todo')
    await this.docClient.delete({
      TableName: this.todoTable,
      Key: {
        todoId,
        userId
      },
    }).promise(); 

    logger.info('successfully deleted todo')
  }

  async getTodos(userId: string): Promise<TodoItem[]> {
    logger.info('fetching user todos')
    const todos = await this.docClient.query({
      TableName: this.todoTable,
      IndexName: this.index,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    }).promise()

    logger.info('fetched all todos')

    return todos!.Items as TodoItem[];
  }
}


  function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      logger.info('creating local db instance')
      return new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
    return new AWS.DynamoDB.DocumentClient()
  }
