const Sequelize = require('sequelize');
const { STRING } = Sequelize;
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/sandwichspa');

const syncAndSeed = async()=> {
  await conn.sync({ force: true });

  let ingredients = [
    {name: "Bacon"}, 
    {name: "Blue_Cheese"},
    {name: "Bread"}, 
    {name: "Buffalo_Sauce"},
    {name: "Chicken"},
    {name: "Lettuce"},
    {name: "Liverwurst"},
    {name: "Mayo"},
    {name: "Mustard"},
    {name: "Onion"},
    {name: "Tomato"}, 
    {name: "Turkey"}
  ];


  ingredients = await Promise.all(ingredients.map( ingredient => Ingredient.create(ingredient)));

  ingredients = ingredients.reduce( (acc, ingredient) => {
    acc[ingredient.name] = ingredient;
    return acc;
  }, {}); 

  let starters = await Promise.all(['Buffalo_Chicken_Sandwich', 'Liverwurst_Sandwich', 'Turkey_Club'].map( name => Starter.create({ name })));
  starters = starters.reduce( (acc, starter) => {
    acc[starter.name] = starter;
    return acc;
  }, {});


  const builts = await Promise.all([
    Built.create({ starterId: starters.Buffalo_Chicken_Sandwich.id, ingredientId: ingredients.Bread.id}),
    Built.create({ starterId: starters.Liverwurst_Sandwich.id, ingredientId: ingredients.Bread.id}),
    Built.create({ starterId: starters.Turkey_Club.id, ingredientId: ingredients.Bread.id}),
    Built.create({ starterId: starters.Buffalo_Chicken_Sandwich.id, ingredientId: ingredients.Onion.id}),
    Built.create({ starterId: starters.Liverwurst_Sandwich.id, ingredientId: ingredients.Onion.id}),
    Built.create({ starterId: starters.Buffalo_Chicken_Sandwich.id, ingredientId: ingredients.Chicken.id}),
    Built.create({ starterId: starters.Turkey_Club.id, ingredientId: ingredients.Chicken.id}),
    Built.create({ starterId: starters.Buffalo_Chicken_Sandwich.id, ingredientId: ingredients.Lettuce.id}),
    Built.create({ starterId: starters.Turkey_Club.id, ingredientId: ingredients.Lettuce.id}),
    Built.create({ starterId: starters.Buffalo_Chicken_Sandwich.id, ingredientId: ingredients.Tomato.id}),
    Built.create({ starterId: starters.Turkey_Club.id, ingredientId: ingredients.Tomato.id}),
    Built.create({ starterId: starters.Turkey_Club.id, ingredientId: ingredients.Turkey.id}),
    Built.create({ starterId: starters.Buffalo_Chicken_Sandwich.id, ingredientId: ingredients.Blue_Cheese.id}),
    Built.create({ starterId: starters.Buffalo_Chicken_Sandwich.id, ingredientId: ingredients.Buffalo_Sauce.id}),
    Built.create({ starterId: starters.Liverwurst_Sandwich.id, ingredientId: ingredients.Liverwurst.id}),
    Built.create({ starterId: starters.Liverwurst_Sandwich.id, ingredientId: ingredients.Mustard.id}),
    
   
    
  ]);


  return {
    starters,
    ingredients,
    builts
  };

};

const Starter = conn.define('starter', {
  name: {
    type: STRING
  }
});
const Built = conn.define('built', {});
const Ingredient = conn.define('ingredient', {
  name: {
    type: STRING
  }
});

Built.belongsTo(Starter);
Built.belongsTo(Ingredient);

const express = require('express');
const app = express();
const path = require('path');


app.use(express.json());

app.use('/dist', express.static(path.join(__dirname, 'dist')));

app.get('/', (req, res, next)=> res.sendFile(path.join(__dirname, 'index.html')));

app.get('/api/starters', async(req, res, next)=> {
  try {
    res.send(await Starter.findAll());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/ingredients', async(req, res, next)=> {
  try {
    res.send(await Ingredient.findAll());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/starters/:starterId/builts', async(req, res, next)=> {
  try {
    res.send(await Built.findAll({ where: { starterId: req.params.starterId }}));
  }
  catch(ex){
    next(ex);
  }
});

app.post('/api/starters/:starterId/builts', async(req, res, next)=> {
  try {
    const built = {...req.body, starterId: req.params.starterId };
    res.status(201).send(await Built.create(built));
  }
  catch(ex){
    next(ex);
  }
});

app.delete('/api/builts/:id', async(req, res, next)=> {
  try {
    const built = await Built.findByPk(req.params.id);
    await built.destroy();
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

app.use((err, req, res, next)=> {
  res.status(500).send({ error: err.message });
});
const port = process.env.PORT || 3000;

const init = async()=> {
  await syncAndSeed();
  app.listen(port, ()=> console.log(`listening on port ${port}`));
}

init();



