(function($) {
    const app = (function() {        
        const ajax = new XMLHttpRequest();
        let games = null;
        let gameId = null;
        let selectedNumbers = [];
        let cartItems = [];

        (function init() {
            getGamesInfo();
            setButtonsListeners();
            calculateCartValue();
        })();

        function setButtonsListeners() {
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
            makeGameButton();      
        };

        function makeGameButton() {
            const $sectionGamesButtons = $.get('.section__games-buttons');

            for (let counter = 0; counter < games.length; counter++) {
                const $gameLi = document.createElement('li');
                const $gameButton = document.createElement('button');

                setGameButtonStyle(games[counter], $gameLi, $gameButton);
                setGameButtonAttributes($gameButton, counter);

                $gameButton.addEventListener('click', handleSelectedGame);
                $gameLi.appendChild($gameButton);
                $sectionGamesButtons.appendChild($gameLi);                
            };

            setFirstGame();
        };

        function setFirstGame() {
            const $btn = $.get('[data-js="game-button"]');
            gameId = 0;

            setGameData();
            changeGameButtonStyle($btn);
            handleGameRange();
        };

        function setGameButtonAttributes($gameButton, counter) {
            $gameButton.setAttribute('data-js', 'game-button');
            $gameButton.setAttribute('data-id', counter);
            $gameButton.textContent = games[counter].type;
        };

        function setGameButtonStyle(game, li, btn) {
            li.classList.add('section__game');
            btn.classList.add('btn__games');

            btn.style.color = game.color;
            btn.style.borderColor = game.color;
        };

        function handleSelectedGame(e) {    
            isAGameSelected();

            selectedNumbers = [];
            gameId = e.target.dataset.id;

            setGameData();
            changeGameButtonStyle(e.target);
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

        function setGameData() {
            $.get('[data-js="game-name"]').textContent = `FOR ${games[gameId].type.toUpperCase()}`;            
            $.get('[data-js="game-description"]').textContent = games[gameId].description;
        };

        function changeGameButtonStyle(btn) {
            btn.classList.add('btn__games--selected');
            btn.style.backgroundColor = games[gameId].color;
            btn.style.color = '#FFFFFF';
        };

        function handleGameRange() {
            const gameRange = games[gameId].range;
            const $numbersList = $.get('[data-js="numbers-list"]');

            $numbersList.textContent = "";
            makeNumberButton(gameRange, $numbersList);            
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
            setNumbersButtonsListeners();
        };

        function setNumbersButtonsListeners() {
            $.getAll('.btn__numbers').forEach(function(btn) {
                btn.addEventListener('click', handleNumberSelection);
            });
        };

        function handleNumberSelection(e) {
            if(isSelectionFull()) {                
                return;
            };

            const btn = e.target;

            selectedNumbers.push(btn.textContent);
            btn.classList.add('btn__numbers--selected');
            btn.style.backgroundColor = games[gameId].color;

            changeNumberListener(btn, true);
        };

        function handleNumberDeselection(e) {
            const btn = e.target;

            selectedNumbers = selectedNumbers.filter(function(number)  {
                    return number !== btn.textContent;
                }
            );

            btn.classList.remove('btn__numbers--selected');
            btn.style.backgroundColor = "#ADC0C4";
            changeNumberListener(btn, false);
        };

        function changeNumberListener(btn, boolean) {
            if(boolean) {
                btn.removeEventListener('click', handleNumberSelection);
                btn.addEventListener('click', handleNumberDeselection);
                return;
            };

            btn.removeEventListener('click', handleNumberDeselection);
            btn.addEventListener('click', handleNumberSelection);
        };

        function isSelectionFull() {
            if(selectedNumbers.length === games[gameId]["max-number"]) {
                alert('O seu jogo já está completo!');
                return true;
            };            
        };

        function handleClearGame() {
            selectedNumbers = [];
            const selectedNumbersButtons = $.getAll('.btn__numbers--selected');

            selectedNumbersButtons.forEach(changeNumberStyle);
        };

        function changeNumberStyle(btn) {
            btn.classList.remove('btn__numbers--selected');
            btn.style.backgroundColor = "#ADC0C4";
            btn.removeEventListener('click', handleNumberDeselection);
            btn.addEventListener('click', handleNumberSelection);
        };

        function handleCompleteGame() {
            const numbersLeft = games[gameId]["max-number"] - selectedNumbers.length;           

            if(numbersLeft === 0) {
                return;
            };

            let numbersButtons = getUnselectedNumbers();
            let selectRandomNumbers = getRandomNumbers(numbersLeft, numbersButtons);
            
            selectedNumbers = selectedNumbers.concat(selectRandomNumbers);
        };

        function getUnselectedNumbers() {
            let numbersButtons = Array.from($.getAll('.btn__numbers'));
            
            numbersButtons = numbersButtons.filter(function(btn) {
                return !(btn.classList.contains('btn__numbers--selected'));
            });

            return numbersButtons;
        };

        function getRandomNumbers(numbersLeft, numbersButtons) {
            let selectRandomNumbers = [];

            for (let counter = 0; counter < numbersLeft; counter++) {
                let index = Math.floor(Math.random() * numbersButtons.length);
                selectRandomNumbers = [...selectRandomNumbers, numbersButtons[index].textContent];
                
                setSelectedClass(numbersButtons, index);
                changeNumberListener(numbersButtons[index], true);
                numbersButtons.splice(index, 1);
            };

            return selectRandomNumbers;
        };

        function setSelectedClass(btns, index) {
            btns[index].classList.add('btn__numbers--selected');
            btns[index].style.backgroundColor = games[gameId].color;
        };

        function handleAddToCart() {
            if(isCartFull()) {
                return;
            };

            sortSelectedNumbers();
            const cartItem = createCartItemObject();

            if(isGameAlreadyOnCart(cartItem)) {
                alert('Você já adicionou um jogo com esses números ao carrinho!');
                return;
            };            

            cartItems.push(cartItem);
            renderCartItems();
            handleClearGame();
        };

        function isCartFull() {
            const maxNumbers = games[gameId]["max-number"];
            const numbersLeft = maxNumbers - selectedNumbers.length;
            
            if(numbersLeft === maxNumbers) {
                alert('Você não selecionou nenhum número para o seu jogo!');
                return true;
            } else if(numbersLeft > 0 && numbersLeft < maxNumbers) {
                alert(`Você ainda pode selecionar ${numbersLeft} número(s) para o seu jogo!`);
                return true;
            };            
        };

        function isGameAlreadyOnCart(cartItem) {
            const newItemType = cartItem.type;
            const newItemNumbers = cartItem.numbers;
            let boolean = false;


            for (const game of cartItems) {
                if(game.type === newItemType) {
                    boolean = (JSON.stringify(newItemNumbers) === JSON.stringify(game.numbers));
                };
            };
            return boolean;
        };

        function sortSelectedNumbers() {
            selectedNumbers.sort(function(x, y) {
                return x - y;
            });
        };

        function createCartItemObject() {
            const cartItem = {
                id: new Date().getTime(),
                numbers: selectedNumbers,
                type: games[gameId].type,
                price: games[gameId].price,
                color: games[gameId].color
            };            
            return cartItem;
        };        

        function renderCartItems() {
            const $cartList = $.get('[data-js="cart-list"]');

            $.get('.aside__games').classList.add('aside__games--flex');
            $cartList.textContent = "";

            makeCartItem($cartList);
            calculateCartValue();
        };

        function makeCartItem($cartList) {
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
        };

        function makeNumbersParagraph(counter) {
            const $numbersParagraph = document.createElement('p');
            $numbersParagraph.textContent = cartItems[counter].numbers.join(', ');
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

            if(total === 0) {
                makeCartIsEmpty($cartTotalValue, total);
            };

            $cartTotalValue.textContent = formatValue(total);
        };

        function makeCartIsEmpty($cartTotalValue, total) {
            const $cartLi = document.createElement('li');
            const $cartEmpty = document.createElement('img');
            const $cartP = document.createElement('p');

            $cartLi.classList.add('flex-row-align-center');
            $cartLi.style.justifyContent = 'center';
            $cartEmpty.src = '../assets/empty-shopping-cart.svg';
            $cartEmpty.classList.add('aside__empty-cart');
            $cartP.classList.add('aside__empty-message');
            $cartP.textContent = "O carrinho está vazio :(";
            $.get('.aside__games').classList.remove('aside__games--flex');

            $cartLi.appendChild($cartEmpty);
            $cartLi.appendChild($cartP);
            $.get('[data-js="cart-list"]').appendChild($cartLi);
            $cartTotalValue.textContent = formatValue(total);
        }

        function formatValue(value) {
            return value.toLocaleString('pt-br', {
                style: 'currency',
                currency: 'BRL'
            });
        };
    })();    
})(window.DOM);