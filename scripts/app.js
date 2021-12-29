(function($) {
    const app = (function() {        
        const ajax = new XMLHttpRequest();
        let games = null;
        let gameId = null;
        let selectedNumbers = [];
        let cartItems = [];

        (function init() {
            getGamesInfo();
            addButtonsListeners();
        })();

        function addButtonsListeners() {
            $.getAll('[data-js="game-button"]').forEach(function(btn) {
                btn.addEventListener('click', handleSelectedGame);
            });
            $.get('.btn__complete').addEventListener('click', handleCompleteGame);
            $.get('.btn__clear').addEventListener('click', handleClearGame);
            $.get('.btn__add').addEventListener('click', handleAddToCart);
        };

        function getGamesInfo() {
            ajax.open('GET', '../games.json', true);
            ajax.send();            
            ajax.onreadystatechange = handleGamesInfo;
        };

        function isGamesInfoReady() {
            return ajax.readyState == 4 && ajax.status == 200;
        };

        function handleGamesInfo() {
            if(!isGamesInfoReady()) return;

            const data = JSON.parse(ajax.responseText);
            games = data.types;            
        };

        function handleSelectedGame(e) {    
            isAGameSelected();

            selectedNumbers = [];
            gameId = e.target.dataset.id;

            setGameData(e);
            changeGameButtonStyle(e);
            handleGameRange();
        };

        function isAGameSelected() {
            if($.get('.btn__games--selected')) {
                const $selectedGame = $.get('.btn__games--selected');
                $selectedGame.classList.remove('btn__games--selected');
                $selectedGame.style.backgroundColor = '#FFFFFF';
                $selectedGame.style.color = games[gameId].color;
            }
        };

        function setGameData(e) {
            $.get('[data-js="game-name"]').textContent = `FOR ${e.target.textContent.toUpperCase()}`;            
            $.get('[data-js="game-description"]').textContent = games[gameId].description;
        };

        function changeGameButtonStyle(e) {
            e.target.classList.add('btn__games--selected');
            e.target.style.backgroundColor = games[gameId].color;
            e.target.style.color = '#FFFFFF';
        };

        function handleGameRange() {
            const gameRange = games[gameId].range;
            const $numbersList = $.get('[data-js="numbers-list"]');

            $numbersList.textContent = "";
            makeNumberButton(gameRange, $numbersList);
            setNumbersButtonsListeners();
        };

        function makeNumberButton(range, $list) {
            for (let counter = 1; counter <= range; counter++) {
                const $numberLi = document.createElement('li');
                const $numberButton = document.createElement('button');

                $numberLi.classList.add("section__number");   
                $numberButton.classList.add("btn__numbers");

                counter < 10 ? $numberButton.textContent = `0${counter}` : $numberButton.textContent = counter;
                $list.appendChild($numberLi).appendChild($numberButton);
            };
        };

        function setNumbersButtonsListeners() {
            $.getAll('.btn__numbers').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    handleNumberSelection(e);
                });
            });
        };

        function handleNumberSelection(e) {
            if(isSelectionFull()) {                
                return;
            };

            selectedNumbers.push(e.target.textContent);
            e.target.classList.add('btn__numbers--selected');
            e.target.style.backgroundColor = games[gameId].color;

            changeNumberListener(e, true);
        };

        function handleNumberDeselection(e) {
            selectedNumbers = selectedNumbers.filter(function(number)  {
                    return number !== e.target.textContent;
                }
            );

            e.target.classList.remove('btn__numbers--selected');
            e.target.style.backgroundColor = "#ADC0C4";
            changeNumberListener(e, false);
        };

        function changeNumberListener(e, boolean) {
            if(boolean) {
                e.target.removeEventListener('click', handleNumberSelection);
                e.target.addEventListener('click', handleNumberDeselection);
                return;
            };

            e.target.removeEventListener('click', handleNumberDeselection);
            e.target.addEventListener('click', handleNumberSelection);
        };

        function isSelectionFull() {
            if(selectedNumbers.length === games[gameId]["max-number"]) {
                return true;
            };            
        };

        function handleClearGame() {
            selectedNumbers = [];
            const selectedNumbersButtons = $.getAll('.btn__numbers--selected');
            selectedNumbersButtons.forEach(function(btn) {
                btn.classList.remove('btn__numbers--selected');
                btn.style.backgroundColor = "#ADC0C4";
                btn.removeEventListener('click', handleNumberDeselection);
                btn.addEventListener('click', handleNumberSelection);
            });
        };

        function handleCompleteGame() {
            const numbersLeft = games[gameId]["max-number"] - selectedNumbers.length;           

            if(numbersLeft === 0) {
                return;
            };

            let numbersButtons = Array.from($.getAll('.btn__numbers'));
            numbersButtons = numbersButtons.filter(function(btn) {
                return !(btn.classList.contains('btn__numbers--selected'));
            });
            let selectRandomNumbers = [];

            for (let counter = 0; counter < numbersLeft; counter++) {
                let index = Math.floor(Math.random() * numbersButtons.length);
                selectRandomNumbers = [...selectRandomNumbers, numbersButtons[index].textContent];
                addSelectedClass(numbersButtons, index);
                numbersButtons[index].removeEventListener('click', handleNumberSelection);
                numbersButtons[index].addEventListener('click', handleNumberDeselection);
                numbersButtons.splice(index, 1);
            };
            
            selectedNumbers = selectedNumbers.concat(selectRandomNumbers);
        };

        function addSelectedClass(btns, index) {
            btns[index].classList.add('btn__numbers--selected');
            btns[index].style.backgroundColor = games[gameId].color;
        };

        function handleAddToCart() {
            const cartItem = {
                id: Math.floor(Math.random() * 100) + 1,
                numbers: selectedNumbers,
                type: games[gameId].type,
                price: games[gameId].price,
                color: games[gameId].color
            };
            cartItems.push(cartItem);
            renderCartItems();
            handleClearGame();
        };

        function renderCartItems() {
            const $cartList = $.get('[data-js="cart-list"]');

            $cartList.textContent = "";

            for (let counter = 0; counter < cartItems.length; counter++) {
                const $cartLi = document.createElement('li');
                const $cartDiv = document.createElement('div');
                const $cartNumbers = makeNumbersParagraph(counter);             
                const $cartGame = makeGameParagraph(counter);
                const $cartDeleteButton = makeDeleteButton(cartItems[counter].id);                

                $cartLi.classList.add("aside__item", "flex-row-align-center");
                $cartDiv.classList.add("aside__info");
                $cartDiv.style.borderLeft = `4px solid ${cartItems[counter].color}`;
                $cartNumbers.classList.add("aside__numbers");
                $cartGame.classList.add("aside__game");

                $cartList.appendChild($cartLi);
                $cartLi.appendChild($cartDeleteButton);
                $cartLi.appendChild($cartDiv);
                $cartDiv.appendChild($cartNumbers);
                $cartDiv.appendChild($cartGame);
            };

            calculateCartValue();
        };

        function makeNumbersParagraph(counter) {
            const $numbersParagraph = document.createElement('p');
            $numbersParagraph.textContent = cartItems[counter].numbers;
            return $numbersParagraph;
        };

        function makeGameParagraph(counter) {
            const $gameParagraph = document.createElement('p');
            const $gameStrongParagraph = document.createElement('strong');
            const $gamePriceSpan = document.createElement('span');

            $gameStrongParagraph.textContent = cartItems[counter].type;
            $gamePriceSpan.textContent = formatValue(cartItems[counter].price);

            $gameParagraph.style.color = cartItems[counter].color;
            $gamePriceSpan.classList.add("aside__price");            

            $gameParagraph.appendChild($gameStrongParagraph);
            $gameParagraph.appendChild($gamePriceSpan);
            return $gameParagraph;
        };

        function makeDeleteButton(id) {
            const $deleteButton = document.createElement('button');
            const $trashBin = document.createElement('img');

            $trashBin.src = '../assets/trash-bin.svg'; 
            $deleteButton.classList.add('aside__delete');

            $deleteButton.appendChild($trashBin);
            $deleteButton.addEventListener('click', function(e) {
                handleDeleteCartItem(e, id);
            });
            return $deleteButton;
        };

        function handleDeleteCartItem(e, id) {
            cartItems = cartItems.filter(function(item) {
                return item.id !== id;
            });
            renderCartItems();
        };

        function calculateCartValue() {
            const $cartTotalValue = $.get('.aside__total-value');
            const total = cartItems.reduce(function(acc, currentValue) {
                return acc + currentValue.price;
            }, 0);

            $cartTotalValue.textContent = formatValue(total);
        };

        function formatValue(value) {
            return value.toLocaleString('pt-br', {
                style: 'currency',
                currency: 'BRL'
            });
        };
    })();    
})(window.DOM);