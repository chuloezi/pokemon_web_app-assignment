const pokemonGrid = document.getElementById("pokemonGrid");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const pageInfo = document.getElementById("pageInfo");

const limit = 20;
let offset = 0;
let currentPokemon = [];
let allPokemon = [];
let hasNextPage = true;

let searchTimer;

// Load the names/URLs of all Pokemon for global searching
async function loadAllPokemonNames() {
  try {
    const response = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0"
    );

    if (!response.ok) {
      throw new Error("Could not load Pokemon names.");
    }

    const data = await response.json();

    // This contains only lightweight name + URL objects
    allPokemon = data.results;
  } catch (error) {
    console.error("Could not load Pokemon names:", error);
  }
}

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


// Search ALL Pokemon
searchInput.addEventListener("input", function () {
  clearTimeout(searchTimer);

  const searchText = searchInput.value
    .toLowerCase()
    .trim();

  // If search is empty, show the current paginated page again
  if (searchText === "") {
    displayPokemon(currentPokemon);

    const pageNumber = Math.floor(offset / limit) + 1;
    pageInfo.textContent = `Page ${pageNumber}`;

    prevButton.disabled = offset === 0;
    nextButton.disabled = !hasNextPage;

    return;
  }

  // Wait briefly so we don't make API calls on every keystroke
  searchTimer = setTimeout(async function () {
    const matches = allPokemon.filter(function (pokemon) {
      return pokemon.name
        .toLowerCase()
        .includes(searchText);
    });

    if (matches.length === 0) {
      displayPokemon([]);
      pageInfo.textContent = "Search results";
      prevButton.disabled = true;
      nextButton.disabled = true;
      return;
    }

    try {
      message.textContent = "Searching Pokemon...";

      // Limit displayed search results to 20
      const visibleMatches = matches.slice(0, 20);

      const pokemonRequests = visibleMatches.map(
        async function (pokemon) {
          const response = await fetch(pokemon.url);

          if (!response.ok) {
            throw new Error(
              "Could not load Pokemon details."
            );
          }

          return response.json();
        }
      );

      const pokemonDetails =
        await Promise.all(pokemonRequests);

      displayPokemon(pokemonDetails);

      pageInfo.textContent =
        `${matches.length} search result${
          matches.length === 1 ? "" : "s"
        }`;

      // Pagination is for the main list, not search results
      prevButton.disabled = true;
      nextButton.disabled = true;
    } catch (error) {
      message.textContent =
        "Something went wrong while searching.";

      console.error(error);
    }
  }, 300);
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
async function initializeApp() {
  await loadAllPokemonNames();
  await loadPokemon();
}

initializeApp();