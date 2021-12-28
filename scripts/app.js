(function($) {
    const app = (function() {
        const $gameName = $.get('[data-js="game-name"]');
        const $gameDescription = $.get('[data-js="game-description"]');
        const $numbersList = $.get('[data-js="numbers-list"]');
        const ajax = new XMLHttpRequest();

        let games = null;

        (function init() {
            getGames();
        })();

        function getGames() {
            ajax.open('GET', '../games.json', true);
            ajax.send();            
            ajax.onreadystatechange = handleGamesRequest;
        }

        function isReady() {
            return ajax.readyState == 4 && ajax.status == 200;
        };

        function handleGamesRequest() {
            if(!isReady()) return;

            const data = JSON.parse(ajax.responseText);
            games = data.types;
            handleSelectedGame();
        };

        function handleSelectedGame() {
            $gameName.textContent = `FOR ${games[0].type.toUpperCase()}`;
            $gameDescription.textContent = games[0].description;
            handleGameRange();
        };

        function handleGameRange() {
            const gameRange = games[0].range;
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