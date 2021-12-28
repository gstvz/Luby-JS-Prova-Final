(function($) {
    const app = (function() {
        const $gameName = $.get('[data-js="game-name"]');
        const $gamesButtons = $.getAll('[data-js="game-button"]');
        const $gameDescription = $.get('[data-js="game-description"]');
        const $numbersList = $.get('[data-js="numbers-list"]');
        const ajax = new XMLHttpRequest();

        let games = null;

        (function init() {
            getGames();
            addEventListeners();
        })();

        function addEventListeners() {
            $gamesButtons.forEach(function(btn) {
                btn.addEventListener('click', handleSelectedGame);
            });
        };

        function getGames() {
            ajax.open('GET', '../games.json', true);
            ajax.send();            
            ajax.onreadystatechange = handleGamesRequest;
        };

        function isReady() {
            return ajax.readyState == 4 && ajax.status == 200;
        };

        function handleGamesRequest() {
            if(!isReady()) return;

            const data = JSON.parse(ajax.responseText);
            games = data.types;            
        };

        function handleSelectedGame(e) {
            $gameName.textContent = `FOR ${e.target.textContent.toUpperCase()}`;            
            $gameDescription.textContent = games[e.target.dataset.id].description;
            handleGameRange(e.target.dataset.id);
        };

        function handleGameRange(id) {
            const gameRange = games[id].range;
            $numbersList.textContent = "";
            for (let counter = 1; counter <= gameRange; counter++) {
                const $numberLi = document.createElement('li');
                const $numberButton = document.createElement('button');

                $numberLi.classList.add("section__number");   
                $numberButton.classList.add("btn__numbers");                

                counter < 10 ? $numberButton.textContent = `0${counter}` : $numberButton.textContent = counter;  

                $numbersList.appendChild($numberLi).appendChild($numberButton);
            };
        };
    })();    
})(window.DOM);