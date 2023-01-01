const GAME_STATE = {
  ChooseGameMode: 'ChooseGameMode',
  GameModeMemorizingGame: 'GameModeMemorizingGame',
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {
  getCardElement (index) {
    return `<div data-index="${index}" class="card back"></div>`
  },

  getCardContent (index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]

    return `
      <p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>
    `
  },

  transformNumber (number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards (indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },

  flipCards (...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.classList.add('front')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      card.classList.add('back')
      card.classList.remove('front')
      card.innerHTML = null
    })
  },

  pairCards (...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore (score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTimes (times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },

  appendWrongAnimation (...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },

  showGameFinished () {
    const div = document.createElement('div')

    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
      <button id="gameBoardReset" type="button" class="btn btn-primary">Reset Game</button>
      <button id="backToMenu" type="button" class="btn btn-secondary">Return to menu</button>
    `
    const header = document.querySelector('#header')
    header.before(div)
  },
  
  generateOptionMenu () {
    const title = document.getElementById('title')
    const menu = document.getElementById('menu')
    title.innerHTML = ``
    menu.innerHTML = 
      `
      <div id="buttonSelector">
        <h2>Choose Game mode</h2>
        <button id="memo-game" onclick="controller.settingGameBoardToMemorizingGame()" class="btn btn-primary">Memorizing game</button>
        <button id="blackjack-game" onclick="controller.settingGameBoardToBlackJack()" class="btn btn-primary">Black Jack</button>
      </div>
      `
  },
  
  generateMemorizeGameTitle () {
    const menu = document.getElementById('menu')
    const title = document.getElementById('title')
    const scoreBoard = document.getElementById('scoreBoard')
    menu.innerHTML = ""
    title.innerHTML =
    `<img src="https://assets-lighthouse.alphacamp.co/uploads/image/file/17990/__.png">
      <h2>Memorizing Game</h2>`
    scoreBoard.innerHTML =
    `<p class="score">Score: 0</p>
    <p class="tried">You've tried: 0 times</p>`;
  },
  
  resetGameBoard () {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = ""
  }
}

const model = {
  revealedCards: [],

  isRevealedCardsMatched () {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,
  triedTimes: 0
}

const controller = {
  currentState: GAME_STATE.ChooseGameMode,

  generateMemorizingGameBoard () {
    view.generateMemorizeGameTitle()
    view.displayCards(utility.getRandomNumberArray(52))
  },
  
  generateMenu () {
    view.generateOptionMenu()
  },
  
  dispatchGameScreenAction () {
    switch (this.currentState) {
      case GAME_STATE.ChooseGameMode:
        controller.generateMenu()
        break
        
      case GAME_STATE.GameModeMemorizingGame:
        controller.generateMemorizingGameBoard()
        controller.addMemorizingGameListener()
        this.currentState = GAME_STATE.FirstCardAwaits
        break
    }
  },
  
  dispatchCardAction (card) {
    console.log(this.currentState)
    console.log(card)
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)

        view.flipCards(card)
        model.revealedCards.push(card)

        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore(model.score += 10)
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            controller.addGameEndMenuListener()
            return
          }
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },

  resetCards () {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
  
  addMemorizingGameListener() {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', event => {
        controller.dispatchCardAction(card)
      })
    })
  },
  
  backToMenu () {
    this.currentState = GAME_STATE.ChooseGameMode
    controller.dispatchGameScreenAction()
    view.resetGameBoard()
  },
  
  settingGameBoardToMemorizingGame () {
    controller.currentState = GAME_STATE.GameModeMemorizingGame
    controller.generateMemorizingGameBoard()
  },
  
  settingGameBoardToBlackJack () {
    alert('still at working progress')
  },
  
  addGameEndMenuListener () {
    const reset = document.getElementById("gameBoardReset")
    const returnToMenu = document.getElementById("backToMenu")
    reset.addEventListener('click', function onclick(event) {
      controller.resetModelRecord()
      controller.currentState = GAME_STATE.GameModeMemorizingGame
      controller.dispatchGameScreenAction()
      const elements = document.getElementsByClassName("completed")
      while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0])
      }
    })
    returnToMenu.addEventListener('click', function onclick(event) {
      controller.resetModelRecord()
      controller.backToMenu()
      const elements = document.getElementsByClassName("completed")
      while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0])
      }
    })
  },
  
  resetModelRecord () {
    model.revealedCards = []
    model.score = 0
    model.triedTimes = 0
  }
}

const utility = {
  getRandomNumberArray (count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const menu = document.getElementById("menu")
//add eventListener
menu.addEventListener('click', function onclick(event) {
  if(event.target.id === "memo-game") {
    controller.currentState = GAME_STATE.GameModeMemorizingGame
    controller.dispatchGameScreenAction()
  }
})

controller.dispatchGameScreenAction()