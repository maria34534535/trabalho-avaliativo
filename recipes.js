const express = require('express');
const {
  createRecipe,
  getOneRecipe,
  getAllRecipes,
  editRecipe,
  deleteRecipe,
} = require('../database/recipes');
const auth = require('../middleware/auth');
const z = require('zod');
const router = express.Router();

const recipeSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(3),
  preparationTime: z.number(),
});

router.post('/recipes', auth, async (req, res) => {
  try {
    const recipe = recipeSchema.parse(req.body);
    const newRecipe = {
      name: recipe.name,
      description: recipe.description,
      preparationTime: recipe.preparationTime,
      userId: req.user.userId,
    };

    await createRecipe(newRecipe);
    res.status(201).json({
      message: 'Created',
      newRecipe,
    });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({
        message: err.message,
      });
    res.status(500).json({
      message: 'Server Error',
    });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const recipe = recipeSchema.parse(req.body);

    const id = Number(req.params.id);
    const recipeToEdit = await getOneRecipe(req.user.userId, id);

    if (!recipeToEdit)
      return res
        .status(401)
        .json({ message: 'Você não é o dono dessa receita' });

    const newRecipe = {
      name: recipe.name,
      description: recipe.description,
      preparationTime: recipe.preparationTime,
    };
    const newRecipeSaved = await editRecipe(req.user.userId, newRecipe);

    res.status(200).json({
      message: 'Receita editada com sucesso',
      newRecipeSaved,
    });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({
        message: err.message,
      });
    res.status(500).json({
      message: 'Server Error',
    });
  }
});

router.get('/recipes/:id', auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const recipe = await getOneRecipe(req.user.userId, id);

    if (!recipe)
      return res
        .status(401)
        .json({ message: 'Você não é o dono dessa receita' });

    delete recipe.user.password;
    res.status(200).json({
      message: 'Recipe retrived',
      recipe,
    });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({
        message: err.message,
      });
    res.status(500).json({
      message: 'Server Error',
    });
  }
});

router.get('/recipes/all', auth, async (req, res) => {
  try {
    const allRecipesFromUser = await getAllRecipes(req.user.userId);

    if (!allRecipesFromUser.length)
      return res.status(400).json({ message: 'Recipes not found' });

    allRecipesFromUser.forEach((it) => delete it.user.password);

    res.status(200).json({
      message: 'Recipes retrived',
      allRecipesFromUser,
    });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({
        message: err.message,
      });
    res.status(500).json({
      message: 'Server Error',
    });
  }
});

router.delete('/recipes/:id', auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const recipe = await getOneRecipe(id);

    if (recipe.userId != req.user.userId)
      return res
        .status(401)
        .json({ message: 'Você não é o dono dessa receita' });

    await deleteRecipe(id);

    res.status(200).json({
      message: 'Recipe deleted',
    });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({
        message: err.message,
      });
    console.log(err);
    res.status(500).json({
      message: 'Server Error',
    });
  }
});

module.exports = {
  router,
};
