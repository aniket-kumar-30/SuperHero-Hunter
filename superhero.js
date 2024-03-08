const input = document.getElementById('input-box');
const displayCharacters = document.getElementById('characters-list')
const listContainer = document.getElementById('list-container');
let [timestamp,apikey,hashValue] = [ts,publickey,hashvalue];
let favCharacterList = [];

// global variable have current page path
const global = {
    currentPage: window.location.pathname
}
console.log(global.currentPage)
// Highlight active nav link
// function highlightActiveLink(){
//     const links = document.querySelectorAll('.nav-item');
//     const currentPage = global.currentPage.split('/')[0];
//     console.log(currentPage)
//     links.forEach(link => {
//         if(link.getAttribute('href') == currentPage){
//             link.classList.add('active-nav');
//         }else{
//             link.classList.remove('active-nav');
//         }
//     });
// }


// fetch superhero characters
async function fetchCharacters(){
    const url = `https://gateway.marvel.com:443/v1/public/characters?ts=${timestamp}&apikey=${apikey}&hash=${hashValue}`;
    const response = await fetch(url);
    const data = await response.json();
    const characters = data.data.results;
    showCharacters(characters);
}

// Show Characters
function showCharacters(characters){
    try {
        if(characters == null){
            document.querySelector('.content').style.display = 'block';
        }else{
            document.querySelector('.content').style.display = 'none'
            displayCharacters.innerHTML = '';
            let value = '';
            characters.forEach(character => {
                value += `
                    <li>
                        <a href="characterdetails.html?characterId=${character.id}">
                            <div class="fav-icon" data-characterId=${character.id}>
                                <img src="./static/8666698_star_icon.png" alt="logo">
                            </div>
                            <div class="characters-img">
                                <img src=${character.thumbnail['path']+"."+character.thumbnail['extension']}>
                            </div>
                            <h3 class="characters-name">${character.name}</h3>
                        </a>
                    </li>
                `
            });
            displayCharacters.innerHTML = value;

            let list = document.querySelectorAll('#characters-list li');
            for(let i = 0;i<list.length;i++){
                setTimeout(() => {
                    list[i].style.visibility = 'visible';
                },100*i);
            }
        }
        const favBtn = document.querySelectorAll('#characters-list .fav-icon');
        for(let i = 0;i<favBtn.length;i++){
            const characterId = favBtn[i].getAttribute('data-characterId');
            favCharacterList.forEach(item => {
                if(item.split(',')[0] == characterId){
                    favBtn[i].classList.add('active');
                }
            })
            favBtn[i].addEventListener('click',async function(e){
                e.preventDefault()
                if(checkCharacterInFavCharactersList(characterId)){
                    e.target.parentElement.classList.add('active')
                    const url = `https://gateway.marvel.com:443/v1/public/characters/${characterId}?ts=${timestamp}&apikey=${apikey}&hash=${hashValue}`;
                    const response = await fetch(url);
                    const data = await response.json();
                    const [character] = data.data.results;
                    favCharacterList.push(characterId+','+character.name+','+character.thumbnail['path']+"."+character.thumbnail['extension']);
                    localStorage.setItem('fav-characters',JSON.stringify(favCharacterList));
                    showNotification('added','Character added')
                    removeShowNotificationDiv('.added')
                }
            })
        }
    } catch (error) {
        console.log(error)
    }

}

//  Checking meal in favourite meal list
function checkCharacterInFavCharactersList(characterId){
    let flag = true;
    favCharacterList.forEach(character => {
        if(characterId == character.split(',')[0]){
            console.log("character already saved to my fav list")
            showNotification('added','character already added')
            removeShowNotificationDiv('.added')
            flag = false;
        }
    })
    return flag;
}

// Function to get Favourite characters from local storage
function getFavourteCharacters(){
    charactersFromDB = JSON.parse(localStorage.getItem('fav-characters'))
    if(charactersFromDB !== null){
        charactersFromDB.forEach(character => {
            favCharacterList.push(character)
        })
    }
}

// Function to fetch and display character details
async function fetchAndShowCharacterDetails(){
    let characterId = window.location.search.split('=')[1];
    console.log(characterId);
    const url = `https://gateway.marvel.com:443/v1/public/characters/${characterId}?ts=${timestamp}&apikey=${apikey}&hash=${hashValue}`;
    const response = await fetch(url);
    const data = await response.json();
    const [character] = data.data.results;
    if(character == null){
        document.querySelector('.content').style.display = 'block';
    }else{
        document.querySelector('.content').style.display = 'none';
        console.log(character);
        document.getElementById('character-details').innerHTML = `
            <div class="character-img">
                <img src=${character.thumbnail['path']+"."+character.thumbnail['extension']}>
            </div>
            <div class="character-detail">
                <h2 class="character-name">${character.name}</h2>
                <p class="character-description">${character.description}</p>
                <div class="comics-info">
                    <p>Comics Avaliable : ${character.comics.available}</p>
                    <button class="link-btn">
                        <a href=${character.comics.collectionURI}>Comics Collection</a>
                    </button>
                </div>
                <div class="events-info">
                    <p>Events Avaliable : ${character.events.available}</p>
                    <button class="link-btn">
                        <a href=${character.events.collectionURI}>Events Collection</a>
                    </button>
                </div>
                <div class="events-info">
                    <p>Series Avaliable : ${character.series.available}</p>
                    <button class="link-btn">
                        <a href=${character.series.collectionURI}>Seriess Collection</a>
                    </button>
                </div>
                <div class="stories-info">
                    <p>Stories Avaliable : ${character.stories.available}</p>
                    <button class="link-btn">
                        <a href=${character.stories.collectionURI}>Stories Collection</a>
                    </button>
                </div>
            </div>
            <div id="more-info">
                ${character.series.items.length > 0 ? 
                    `
                    <div>
                        <h4>Series</h4>
                        <ul class="series-list">
                            ${character.series.items.slice(0,4).map(item =>
                                `<li>${item['name']}</li>`).join('')}
                        </ul>
                    </div>
                    `:''
                }
                ${character.stories.items.length > 0 ?
                    `
                    <div>
                        <h4>Stories</h4>
                        <ul class="stories-list">
                            ${character.stories.items.slice(0,4).map(item =>
                                `<li>${item['name']}</li>`).join('')}
                        </ul>
                        </div>
                    `:''
                }
                ${character.comics.items.length > 0 ?
                    `
                    <div>
                        <h4>Comics</h4>
                        <ul class="comic-list">
                            ${character.comics.items.slice(0,4).map(item =>
                                `<li>${item['name']}</li>`).join('')}
                        </ul>
                        </div>
                    `:''
                }
                ${character.events.items.length > 0 ?
                    `
                    <div>
                        <h4>Events</h4>
                        <ul class="events-list">
                            ${character.events.items.slice(0,4).map(item =>
                                `<li>${item['name']}</li>`).join('')}
                        </ul>
                        </div>
                    `:''
                }
            </div>
        `
    }
}


// Function to display favourite characters
function favouriteCharacters(){
    charactersFromDB = JSON.parse(localStorage.getItem('fav-characters'));
    let charactersList = '';
    if(charactersFromDB !== null){
        charactersFromDB.forEach(character =>{
            const characterId = character.split(',')[0];
            charactersList += `
            <div style="background:url(${character.split(',')[2]}) no-repeat center center; background-size: cover;" class="list-item">
                <li class="character-item" id=${characterId} data-characterImg=${character.split(',')[2]}>
                ${character.split(',')[1]}
                </li>
                <span id=${characterId}><img src="./static/8666554_minus_square_icon.png" class="delete" alt=""></span>
            </div>
            `
        })
        document.querySelector('#fav-character-list').innerHTML = charactersList;
    }
}

// Function to delete characters
function deleteCharacter(id){
    let charactersList = document.querySelectorAll('.character-item')
    charactersList = Array.from(charactersList);
    const newList = charactersList.filter((character) => {
       return character.id !== id
    });
    console.log(charactersList)
    favCharacterList = [];
    newList.map(list =>{
        let data = `${list.id},${list.textContent},${list.getAttribute('data-characterImg')}`;
        favCharacterList.push(data.toString());
    })
    console.log(newList)
    localStorage.clear()
    localStorage.setItem('fav-characters',JSON.stringify(favCharacterList));
    favouriteCharacters()
}
// Function to show notification
function showNotification(className,msg){
    const div = document.createElement('div');
    div.className = `${className}`
    div.innerHTML = `
        <p>
            ${msg}
        </p>
        <p class=${className==='added'?'green':'red'}></p>
    `
    const parentDiv = document.querySelector(`${className == 'added'? 'header':'#favourite-characters'}`)
    parentDiv.insertBefore(div, document.querySelector(`${className == 'added'? '#input-container':'.title'}`))
}
// Delete all favourite characters
function deleteAllFavCharacters(){
    let characterList = document.querySelectorAll('#fav-character-list div');
    characterList.forEach(item =>{
        item.remove();
    })
    showNotification('deleted','All Characters deleted')
    removeShowNotificationDiv('.deleted')
    localStorage.clear('fav-characters');
}
function showORHideDeleteAllIcon(){
    let characterList = document.querySelectorAll('#fav-character-list div');
    if(characterList.length < 1){
        document.getElementById('delete-all').style.display = 'none'
    }else{
        document.getElementById('delete-all').style.display = 'block'
    }
}
// Function to remove notification
function removeShowNotificationDiv(className){
    setTimeout(() => {
        document.querySelector(className).remove()
    },1000)
}

// Empty list container after input is empty
function removeListcontainer(){
    listContainer.innerHTML = '';
}

function autoDisplayCharactersList(){
    input.addEventListener('keyup',async function (e){
        removeListcontainer();
        if(input.value.trim().length < 4){
            return false;
        }
        const url = `https://gateway.marvel.com:443/v1/public/characters?ts=${timestamp}&apikey=${apikey}&hash=${hashValue}&nameStartsWith=${input.value}`;
        const response = await fetch(url);
        const jsonData = await response.json();
        const characters = jsonData.data.results;
        // console.log(characters);
        characters.forEach(character => {
            let name = character.name;
            let div = document.createElement('div');
            div.style.cursor = 'pointer';
            div.className = 'autocomplete-name';
            div.setAttribute('onclick',"displayWords('" + name + "');");
            let word = `<b>${name.substring(0,input.value.length)}</b>`
            word += name.substring(input.value.length);
            div.innerHTML = `<p>${word}</p>`
            listContainer.appendChild(div);
        })
    })
}


function displayWords(name){
    input.value = name;
    removeListcontainer();
}

async function handleClick(e){
    if(e.target.id == 'submit-button'){
        if(input.value.trim().length < 1){
            return false;
        }
        removeListcontainer()
        const url = `https://gateway.marvel.com:443/v1/public/characters?ts=${timestamp}&apikey=${apikey}&hash=${hashValue}&nameStartsWith=${input.value}`;
        const response = await fetch(url);
        const jsonData = await response.json();
        const characters = jsonData.data.results;
        showCharacters(characters)
    }else if(e.target.classList.contains('delete')){
        let id = e.target.parentElement.id;
        deleteCharacter(id);
        showNotification('deleted','Character deleted');
        removeShowNotificationDiv('.deleted');
    }else if(e.target.parentElement.id == 'delete-all'){
        deleteAllFavCharacters();
        showORHideDeleteAllIcon();
    }
    
}
document.addEventListener('click',handleClick);

function init(){
    switch(global.currentPage){
        case '/home.html':
            console.log('Home Page');
            fetchCharacters();
            autoDisplayCharactersList();
            getFavourteCharacters();
            break;
        case '/characterdetails.html':
            console.log('Character Detail page');
           fetchAndShowCharacterDetails()
            break;
        case '/favouritecharacters.html':
            console.log('Favourte Meal page');
            favouriteCharacters();
            showORHideDeleteAllIcon();
            break;
    }
    highlightActiveLink();
    // fetchMealList();
    // fetchMealData();
}


document.addEventListener('DOMContentLoaded',init)