const canvasUI = {
    start: document.querySelector('.btn--start'),
    cashAmount: document.getElementById('cashAmount'),
    betAmount: document.getElementById('betAmount'),
};
  
let values = [];
for (let i = 0; i <= 7; i++){
    values.push(i);
}
const GAME = {
    defCash: 100,
    bet: 10,
    values,
    random: []
};
GAME.cash = GAME.defCash;
  

const canva = document.getElementById('canva');
const ctx = canva.getContext('2d');

canvasUI.cashAmount.innerHTML = GAME.cash;
canvasUI.betAmount.innerHTML = GAME.bet;

refreshRender();
window.onresize = refreshRender;

function refreshRender() {
    setDisplayCanvas();
    setDisplayCanvasUI();
    computePosElems();
    renderCanvas();
}
function setDisplayCanvas() {
    canva.width = canva.parentNode.clientWidth;
    canva.height = canva.width * 3/4;
}
function setDisplayCanvasUI() {
    let btnStartFSize = canva.width / 25;
    canvasUI.start.style.fontSize = btnStartFSize + 'px';
    canvasUI.start.style.padding = `${btnStartFSize/4}px ${btnStartFSize}px`;
    canvasUI.start.style.left = canva.width / 2 - canvasUI.start.clientWidth / 2 + 'px';
}

function renderCanvas() {

    canva.width = canva.parentNode.clientWidth;
    for (let drum = 1; drum <= 3; drum++) {
        GAME[`drum${drum}`].draw();
    }
}

function computePosElems() {
    const { width, height } = canva;
    computeDrums(width, height);
}

function computeDrums(width, height) {
    const drumOpts = {
        w: width*0.25, h: height*0.35,
        values: GAME.values,
        ctx
    };
    drumOpts.x = width*0.25 / 2;
    drumOpts.y = height*0.2 + canvasUI.start.clientHeight / 2;
    
    GAME.drum1 = GAME.drum1 ? GAME.drum1.setting(drumOpts) : new Drum(drumOpts);
    drumOpts.x += drumOpts.w;
    GAME.drum2 = GAME.drum2 ? GAME.drum2.setting(drumOpts) : new Drum(drumOpts);
    drumOpts.x += drumOpts.w;
    GAME.drum3 = GAME.drum3 ? GAME.drum3.setting(drumOpts) : new Drum(drumOpts);
  }
  
  
canvasUI.start.onclick = () => {
    canvasUI.start.disabled = true;
    if (GAME.cash == 0){
        GAME.cash = GAME.defCash;
    }
    GAME.cash -= GAME.bet;
    (new Animation()).add({
      duration: 800, cb: changeCashByProgress
    }).start();
    
    const Anim = new Animation();
    let duration = 0;
    let step = 1500;
    
    for (let i = 1; i <= 3; i++) {
        GAME.random[i - 1] = ~~(Math.random() * GAME.values.length) + GAME.values.length*i;
        duration += step;
        step *= .9;
      
        Anim.add({ duration, timing: 'ease-out',
        cb: (progress) => {
        let currentTurn = GAME.random[i - 1] * progress;
        GAME[`drum${i}`].turn(currentTurn);
          
        if (progress > .99) {
            GAME[`drum${i}`].isStopped = true;
        }
        else {
            GAME[`drum${i}`].isStopped = false;
        }
    }
    });
    }
    
    Anim.add({
        duration, cb: renderCanvas
    }).execAtEnd(() => {
        const combo = [];
        for (let i = 1; i <= 3; i++) {
        combo.push(GAME[`drum${i}`].currentValue);
    }
      
        GAME.cash += getWinnnings(combo);
        (new Animation()).add({
        duration: 800, cb: changeCashByProgress
        }).start();
        canvasUI.start.disabled = false;
    }).start();
};
  
function changeCashByProgress(progress) {
    if (progress <= .5) {
        canvasUI.cashAmount.style.opacity = 1 - progress * 2;
    }
    else {
        canvasUI.cashAmount.innerHTML = GAME.cash;
        canvasUI.cashAmount.style.opacity = progress * 2 - 1;
    }
}
  
function getWinnnings(combo = [], bet = 10) {
    const res = checkCombo(combo);
    let defRes = 0;
    if (res.weight < 1) return defRes;
    const winnnings = {
      '1': { '7': 10 },
      '2': {
            '1': 100, '2': 200, '3': 300, '4': 400,
            '5': 500, '6': 750, '7': 1000
        },
      '3': {
            '1': 2500, '2': 5000, '3': 15000, '4': 25000,
            '5': 50000, '6': 75000, '7': 1000000
      }
    };
    
    if (winnnings[res.weight] && winnnings[res.weight][res.val]) {
        return winnnings[res.weight][res.val] * bet * .1;
    }
    return defRes;
  }

function checkCombo(combo = []) {

    const res = { weight: 0 };
    if (combo[0] === combo[1] && combo[1] === combo[2]) {
        res.val = combo[1];
        res.weight = 3;
    }
    else if (combo[0] === combo[1] || combo[1] === combo[2]) {
        res.val = combo[1];
        res.weight = 2;
    }
    else if ( combo.some((val) => val === 7) ) {
        res.val = 7;
        res.weight = 1;
    }
    return res;
}