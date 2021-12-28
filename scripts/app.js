(function($) {
    const app = (function() {        
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
        };        
    })();    
})(window.DOM);