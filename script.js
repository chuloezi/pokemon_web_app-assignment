const pokemonGrid = document.getElementById("pokemonGrid");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const pageInfo = document.getElementById("pageInfo");

const limit = 20;
let offset = 0;
let currentPokemon = [];
let hasNextPage = true;

// Get 20 Pokemon from the API
async function loadPokemon() {
    try {
        message.textContent = "Loading Pokemon...";
        pokemonGrid.innerHTML = "";

        prevButton.disabled = true;
        nextButton.disabled = true;

        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
        );

        if (!response.ok) {
            throw new Error("Could not load Pokemon.");
        }

        const listData = await response.json();

        // Get more details for each Pokemon
        const pokemonRequests = listData.results.map(async function (pokemon) {
            const detailResponse = await fetch(pokemon.url);

            if (!detailResponse.ok) {
                throw new Error("Could not load Pokemon details.");
            }

            return detailResponse.json();
        });

        currentPokemon = await Promise.all(pokemonRequests);

        hasNextPage = listData.next !== null;

        displayPokemon(currentPokemon);

        const pageNumber = Math.floor(offset / limit) + 1;
        pageInfo.textContent = `Page ${pageNumber}`;

        prevButton.disabled = offset === 0;
        nextButton.disabled = !hasNextPage;

    } catch (error) {
        message.textContent = "Something went wrong. Please try again.";
        console.error(error);
    }
}


// Display Pokemon cards
function displayPokemon(pokemonList) {
    pokemonGrid.innerHTML = "";

    if (pokemonList.length === 0) {
        message.textContent = "No Pokemon found.";
        return;
    }

    message.textContent = "";

    pokemonList.forEach(function (pokemon) {

        const card = document.createElement("div");
        card.className = "pokemon-card";


        // Pokemon image
        const image = document.createElement("img");

        image.src =
            pokemon.sprites.other["official-artwork"].front_default ||
            pokemon.sprites.front_default;

        image.alt = pokemon.name;


        // Pokemon name
        const name = document.createElement("h2");
        name.textContent = pokemon.name;


        // Pokemon type
        const type = document.createElement("p");

        const typeNames = pokemon.types.map(function (item) {
            return item.type.name;
        });

        type.textContent = "Type: " + typeNames.join(", ");


        // Height and weight
        const size = document.createElement("p");

        size.textContent =
            "Height: " +
            pokemon.height +
            " | Weight: " +
            pokemon.weight;


        // Ability button
        const abilityButton = document.createElement("button");

        abilityButton.textContent = "Show Ability";


        abilityButton.addEventListener("click", function () {

            const ability = pokemon.abilities[0].ability.name;

            alert(
                "I am " +
                pokemon.name +
                " and I have " +
                ability +
                "."
            );

        });


        // Add everything to the card
        card.appendChild(image);
        card.appendChild(name);
        card.appendChild(type);
        card.appendChild(size);
        card.appendChild(abilityButton);


        // Add card to the grid
        pokemonGrid.appendChild(card);
    });
}


// Search Pokemon already loaded
searchInput.addEventListener("input", function () {

    const searchText =
        searchInput.value.toLowerCase().trim();


    const filteredPokemon =
        currentPokemon.filter(function (pokemon) {

            return pokemon.name
                .toLowerCase()
                .includes(searchText);

        });


    displayPokemon(filteredPokemon);
});


// Next page button
nextButton.addEventListener("click", function () {

    if (hasNextPage) {

        offset = offset + limit;

        searchInput.value = "";

        loadPokemon();
    }

});


// Previous page button
prevButton.addEventListener("click", function () {

    if (offset >= limit) {

        offset = offset - limit;

        searchInput.value = "";

        loadPokemon();
    }

});


// Load Pokemon when the page opens
loadPokemon();