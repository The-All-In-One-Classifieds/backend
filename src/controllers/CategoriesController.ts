import {Request, Response} from "express";
import {prisma} from "../db";
import {categoriesRouter} from "../routes/categories.routes";
import {AppException} from "../common/AppException";

export class CategoriesController {

    async index(request: Request, response: Response) {
        const categories = await prisma.categories.findMany({
            select: {
                id: true,
                name: true,
                has_childs: true,
                parent_category_id: true,
                child_categories: true,
            }
        });

        console.log("All Categories:\n", categories)
        return response.status(200).json(categories);
    }

    async root(request: Request, response: Response) {
        const parentCategories = await prisma.categories.findMany({
            where: {
                parent_category_id: null
            },
            select: {
                id: true,
                name: true,
                has_childs: true,
            }
        });

        return response.status(200).json(parentCategories);
    }

    async childs(request: Request, response: Response) {
        const categoryId = parseInt(request?.params?.id)

        if(!categoryId) {
            throw new AppException("Category not found.", 404)
        }

        const childCategories = await prisma.categories.findMany({
            where: {
                parent_category_id: categoryId
            },
            select: {
                id: true,
                name: true,
                has_childs: true,
            }
        });

        console.log("Childs  \n", childCategories)
        return response.status(200).json(childCategories);
    }
}