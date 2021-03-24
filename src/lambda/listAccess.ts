import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { List, ListItem } from "../models/type";
import { createLogger } from "../utils/logger";
const logger = createLogger("todos");

export class ListAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly listsTable = process.env.LISTS_TABLE,
    private readonly listItemsTable = process.env.LISTS_ITEM_TABLE,
    private readonly listsTableIndex = process.env.LISTS_TABLE_INDEX,
    private readonly listItemsTableIndex = process.env.LISTS_ITEM_TABLE_INDEX,
    private readonly bucket = process.env.LISTS_BUCKET
  ) {}

  async createList(item: List): Promise<List> {
    logger.info("creating list", { key: item });
    await this.docClient
      .put({
        TableName: this.listsTable,
        Item: item,
      })
      .promise();
    return item;
  }

  async deleteItem(itemId: string, listId: string) {
    logger.info("deleting list item ", itemId);
    await this.docClient
      .delete({
        TableName: this.listItemsTable,
        Key: {
          itemId,
          listId,
        },
      })
      .promise();

    logger.info("successfully deleted list item");
  }

  async updateItemAttachment(itemId: string, listId: string) {
    logger.info("updating todo", { key: itemId });
    const attachmentUrl = `https://${this.bucket}.s3.amazonaws.com/${itemId}`;
    const result = await this.docClient
      .update({
        TableName: this.listItemsTable,
        Key: {
          itemId,
          listId,
        },
        ExpressionAttributeNames: {
          "#attachment": "attachment",
        },
        ExpressionAttributeValues: {
          ":attachment": attachmentUrl,
        },
        UpdateExpression: "SET #attachment = :attachment",
        ReturnValues: "ALL_NEW",
      })
      .promise();
    logger.info("updated successfully");
    return result.Attributes as ListItem;
  }

  async createListItem(listItem: ListItem): Promise<ListItem> {
    logger.info("creating list item", { key: listItem });
    await this.docClient
      .put({
        TableName: this.listItemsTable,
        Item: listItem,
      })
      .promise();

    return listItem;
  }

  async getLists(userId: string): Promise<List[]> {
    logger.info("fetching lists of user");
    const lists = await this.docClient
      .query({
        TableName: this.listsTable,
        IndexName: this.listsTableIndex,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
      .promise();

    logger.info("fetched user lists");

    return lists!.Items as List[];
  }

  async getList(listId: string): Promise<ListItem[]> {
    logger.info("fetching list items of list");
    const items = await this.docClient
      .query({
        TableName: this.listItemsTable,
        IndexName: this.listItemsTableIndex,
        KeyConditionExpression: "listId = :listId",
        ExpressionAttributeValues: {
          ":listId": listId,
        },
      })
      .promise();

    logger.info("fetched items from list");

    return items!.Items as ListItem[];
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info("creating local db instance");
    return new AWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });
  }
  return new AWS.DynamoDB.DocumentClient();
}
