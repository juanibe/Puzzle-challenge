import { getConnection, Repository, SelectQueryBuilder } from 'typeorm';

import { isAuthenticated } from "../../middleware";
import PubSub from "../../subscription";
import { RecipeEntity } from "../../database/entity/recipe.entity";
import { CategoryEntity } from "../../database/entity/category.entity";
import { getResult } from "../../helper/helpers/helpers";
import { Context, updateCategoryInput, createCategoryInput, getCategoriesInput, getOneCategoryInput } from '../../types/interface';
import { categoryEvents } from "../../subscription/events/category";

export = {
  Query: {
    getCategories: async (_: any, input: getCategoriesInput, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

        //Destructuring
        let { page, limit, name, nameRecipe, idRecipe } = input;

        //Define cursor
        let cursor: number = (page * limit) - limit;
        if (!cursor) cursor = 0;

        //Create category repository
        let categoryRepository: Repository<CategoryEntity> = getConnection().getRepository(CategoryEntity);
        let category: SelectQueryBuilder<CategoryEntity> =  categoryRepository.createQueryBuilder("category")
        .innerJoin("category.recipe", "recipe").select("category").skip(cursor).take(limit);

        if(name) category = category.andWhere(`category.name = '${name}'`);
        if(nameRecipe) category = category.andWhere(`recipe.name = '${nameRecipe}'`);
        if(idRecipe) category = category.andWhere(`recipe.id = ${idRecipe}`);

        return await category.getMany();

      } catch (err) {
        throw new Error(err);
      }

    },

    getOneCategory: async (_: any, input: getOneCategoryInput, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

        //Destructuring
        let { id, name, nameRecipe, idRecipe } = input;

        //Create category repository
        let categoryRepository: Repository<CategoryEntity> = getConnection().getRepository(CategoryEntity);

        let category: SelectQueryBuilder<CategoryEntity> =  categoryRepository.createQueryBuilder("category")
        .innerJoin("category.recipe", "recipe").select("category");

        if(name) category = category.andWhere(`category.name = '${name}'`);
        if(nameRecipe) category = category.andWhere(`recipe.name = '${nameRecipe}'`);
        if(idRecipe) category = category.andWhere(`recipe.id = ${idRecipe}`);

        return await category.getOne();
      } catch (err) {
        throw new Error(err)
      }

    },
  },
  Mutation: {
    createCategory: async (_: any, { input }: { input: createCategoryInput }, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

        //Create category repository
        let categoryRepository: Repository<CategoryEntity> = getConnection().getRepository(CategoryEntity);

        //Create category
        let category: CategoryEntity = new CategoryEntity();
        category.name = input.name;

        //Update category
        const Category: CategoryEntity = await categoryRepository.save(category);

        return Category;

      } catch (err) {
        throw new Error(err)
      }

    },

    updateCategory: async (_: any, { id, input }: { id: number, input: updateCategoryInput }, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

        //Create category repository
        let categoryRepository: Repository<CategoryEntity> = getConnection().getRepository(CategoryEntity);

        //Search category
        const category: CategoryEntity[] = await categoryRepository.find({ where: { id }, take: 1 });
        const categoryToUpdate: CategoryEntity = getResult(category)
        categoryToUpdate.name = input.name;

        //Update category
        const Category: CategoryEntity = await categoryRepository.save(categoryToUpdate);


        return Category;

      } catch (err) {
        throw new Error(err)
      }

    },

    deleteCategory: async (_: any, { id }: { id: number }, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

        //Create user repository
        let categoryRepository = getConnection().getRepository(CategoryEntity);

        //Search user
        const category: CategoryEntity[] = await categoryRepository.find({ where: { id }, take: 1 });
        const categoryToRemove: CategoryEntity = getResult(category);

        //Delete task
        await categoryRepository.remove(categoryToRemove);
        categoryToRemove.id = id;

        return categoryToRemove;

      } catch (err) {
        throw new Error(err)
      }

    },
  },
  Subscription: {
    categoryCreated: {
      subscribe: () => PubSub.asyncIterator(categoryEvents.CATEGORY_CREATED)
    },
    categoryUpdated: {
      subscribe: () => PubSub.asyncIterator(categoryEvents.CATEGORY_UPDATED)
    },
    categoryDeleted: {
      subscribe: () => PubSub.asyncIterator(categoryEvents.CATEGORY_DELETED)
    }
  },
  Category: {
    recipe: async (parent: any, __: any) => {
      try {
        let recipe = await getConnection().createQueryBuilder(RecipeEntity, "recipe").innerJoin("recipe.category", "category")
          .where(`category.id = ${parent.id}`).getMany();

        return recipe;
      } catch (err) {
        throw new Error(err);
      }
    }
  }
}
