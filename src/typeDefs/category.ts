import { gql } from 'apollo-server-express';

export = gql`
  extend type Query {  
    getCategories(page: Int, limit: Int, name: String, nameRecipe: String, idRecipe: ID): [Category!]
    getOneCategory(id: ID, name: String, nameRecipe: String, idRecipe: ID): Category
  }

  input createCategoryInput {
    name: String!
  }

  extend type Mutation {
    createCategory(input: createCategoryInput!): Category
    updateCategory(id: ID!, input: updateCategoryInput!): Category
    deleteCategory(id: ID!): Category
  }

  input updateCategoryInput {
    name: String
  }

  type Category {
    id: ID!
    name: String!
    recipe: [Recipe!]
  }

  extend type Subscription {
    categoryCreated: Category
    categoryUpdated: Category
    categoryDeleted: Category
  }
`;