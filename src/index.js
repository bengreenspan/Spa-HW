
const axios = require('axios');
const startersList = document.querySelector('#starters-list');
const ingredientsList = document.querySelector('#ingredients-list');
const builtsList = document.querySelector('#builts-list');

let starters, builts, ingredients;

const renderStarters = ()=> {
  const starterId = window.location.hash.slice(1);
  const html = starters.map( starter => {
    return `
      <li ${ starterId * 1 === starter.id ? 'class=selected': ''}>
        <a href='#${starter.id}'>
          ${ starter.name }
        </a>
      </li>
    `;
  }).join('');
  startersList.innerHTML = html;
};

const renderIngredients = ()=> {
  const html = ingredients.map( ingredient => {
    return `
      <li data-id='${ ingredient.id }'>
        ${ ingredient.name } ${builts.filter( built => built.ingredientId === ingredient.id).length}x
      </li>
    `;
  }).join('');
  ingredientsList.innerHTML = html;
};

const renderBuilts = ()=> {
  const html = builts.map( built => {
    const ingredient = ingredients.find( ingredient => ingredient.id === built.ingredientId); 
    return `
      <li data-id='${built.id}'>
        ${ ingredient.name }
       
      </li>
    `;
  }).join('');
  builtsList.innerHTML = html;
  renderIngredients();
};

ingredientsList.addEventListener('click', async(ev)=> {
  if(ev.target.tagName === 'LI'){
    const ingredientId = ev.target.getAttribute('data-id');
    const starterId = window.location.hash.slice(1);
    const response = await axios.post(`/api/starters/${starterId}/builts`, { ingredientId });
    builts.push(response.data);
    renderBuilts();
  }
});

builtsList.addEventListener('click', async(ev)=> {
  if(ev.target.tagName === 'LI'){
    const builtId = ev.target.getAttribute('data-id');
    await axios.delete(`/api/builts/${builtId}`);
    builts = builts.filter( built => built.id !== builtId*1);
    renderBuilts();
  }
});

const fetchBuilts = async()=> {
  const starterId = window.location.hash.slice(1);
  builts = (await axios.get(`/api/starters/${starterId}/builts`)).data;
  renderBuilts();
};


window.addEventListener('hashchange', async()=> {
  renderStarters();
  fetchBuilts();
});

const setup = async()=> {
  starters = (await axios.get('/api/starters')).data;
  ingredients = (await axios.get('/api/ingredients')).data;
  renderStarters();
  const starterId = window.location.hash.slice(1);
  if(!starterId){
    window.location.hash = starters[0].id;
  }
  if(starterId){
    fetchBuilts();
  }
};

setup();

