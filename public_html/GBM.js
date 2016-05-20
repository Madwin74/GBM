// ================================================================
var enableBetting = true;              // режим ставок вкл/выкл
var baseBet = 1;                        // базовая ставка в битсах
// ================================================================
var round = 0;                          // Раунд игры
var last;                               // Сыгравший коэфициент в предыдущей игре
// ================================================================
var cashedOut = true; // Коэфициент
// ================================================================
var lastGamePlay; // Результат предыдущей игры
var startBR = engine.getBalance();      // Изначальный банкролл
var maxBR = startBR;                    // Максимальный банкролл за игру
var minBR = startBR;                    // Минимальный банкролл за игру
var curBR = startBR;                    // Текущий банкролл
var userName = engine.getUsername();    // Имена текущих игроков
var gamesWon = 0;                       // Количество выиграных ставок
var gamesLost = 0;                      // Количество проигранных ставок
var unplayed = 0;                       // Количество пропущеных игр
var net = 0;                            // Профит
// ================================================================
var busts = new Array();
var cashOutBustRounds = new Array();
// ================================================================
var dataCollection = false;
var Strategy = false;
// ================================================================
engine.on('game_starting', function (data) {
    StartGame();
});
// ================================================================
engine.on('game_started', function (data) {

});
// ================================================================
engine.on('game_crash', function (data) {
    lastGamePlay = engine.lastGamePlay();
    round += 1;
    last = data.game_crash / 100;
    busts.unshift(last);
    curBR = engine.getBalance();
    if (curBR < minBR) {
        minBR = curBR;
    } else if (curBR > maxBR) {
        maxBR = curBR;
    }
    net = curBR - startBR;
    if (lastGamePlay == "WON") {
        gamesWon += 1;
    } else if (lastGamePlay == "LOST") {
        gamesLost += 1;
    } else {
        unplayed += 1;
    }
    logRound();
});
// ================================================================
engine.on('cashed_out', function (data) {
    if (data.username == userName) {
        cashedOut = true;
    } else {
        // Здесь будем собирать коэфициенты других игроков
    }
});
// ================================================================
engine.on('player_bet', function (data) {
    if (data.username == userName) {
        cashedOut = false;
    } else {
        // Здесь будем собирать ставки других игроков
    }
});
// ================================================================
engine.on('msg', function (data) {

});
// ================================================================
engine.on('connect', function (data) {

});
// ================================================================
engine.on('disconnect', function (data) {

});
// ================================================================
function cashOut() {
    if (!cashedOut) {
        engine.cashOut();
        cashedOut = true;
    }
}
// ================================================================
function placeBet(bet, cash, autoCash) {
    if (bet) {
        if (bet > 0) {
            if (cash) {
                if (cash >= 1) {
                    if (enableBetting) {
                        cashedOut = false;
                        cash = parseInt(cash*100);
//                        console.log("engine.placeBet("+bet * 100+", "+cash+", "+autoCash+")");
                        engine.placeBet(bet * 100, cash, autoCash);
                    }
                }
            }
        }
    }
}
// ================================================================
function logRound() {
    var botTitleStr = "\nAfodar's BustaBitBot\n";
    var enableBettingStr = "\nСтавки включены: " + enableBetting;
    var baseBetStr = "\nБазовая ставка: " + baseBet;
    var roundStr = "\nРаунд: " + round;
    var lastStr = "\nСыграло в предыдущей игре: " + last;
    // ================================================================
    var lastGamePlayStr = "\nПредыдущая игра: " + lastGamePlay;
    var startBRStr = "\nСтартовый банкролл: " + startBR;
    var maxBRStr = "\nМаксимальный банкролл: " + maxBR;
    var minBRStr = "\nМинимальный банкролл: " + minBR;
    var curBRStr = "\nТекущий банкролл: " + curBR;
    var userNameStr = "\nАккаунт: " + userName;
    var gamesWonStr = "\nВыигано раудов: " + gamesWon;
    var gamesLostStr = "\nПроиграно раундов: " + gamesLost;
    var unplayedStr = "\nНе сыграно раундов: " + unplayed;
    var netStr = "\nПрофит: " + net;
    console.log("\n\n" +
            botTitleStr +
            enableBettingStr +
            baseBetStr +
            roundStr +
            lastStr +
            lastGamePlayStr +
            startBRStr +
            maxBRStr +
            minBRStr +
            curBRStr +
            userNameStr +
            gamesWonStr +
            gamesLostStr +
            unplayedStr +
            netStr +
            "\n" +
            busts
            );
}
// Для сортировки массива
// ================================================================
numberSort = function (a, b) {
    return a - b;
};

// Средняя из массива
// ================================================================
function mean(arr) {
    if (arr) {
        if (arr.constructor === Array) {
            if (arr.length >= 1) {
                var sum = 0;
                for (var i = 0; i < arr.length; i++) {
                    sum += arr[i];
                }
                return (sum / arr.length);
            }
        }
    }
    return -1;
}

// Экспоненциональная средняя из массива
// =======================================================
function median(arr) {
    if (arr) {
        if (arr.constructor === Array) {
            if (arr.length >= 1) {
                arr = arr.sort(numberSort);
                if ((arr.length % 2) == 0) {
                    // Even
                    return (((arr[arr.length / 2] + arr[(arr.length / 2) - 1])) / 2);
                } else {
                    // Odd
                    return (arr[Math.floor(arr.length / 2)])
                }
            }
        }
    }
    return -1;
}

// Подсчет экспоненциональная средней разрыва между коэфициентами
// =======================================================
function stepMA(arr, cr) {
    if (arr) {
        if (arr.constructor === Array) {
            if (arr.length >= 1) {
                var stepsMA = [];
                var stepInc = 0;
                for (var i = 0; i < arr.length; i++) {
                    stepInc++;
                    if (((arr[i] >= cr) && (arr[i] < (cr + 1))) || ((arr[i] >= cr) && (cr == 5))) {
                        stepsMA.push(stepInc);
                        stepInc = 0;
                    }
                }
                return median(stepsMA);
            }
        }
    }
    return -1;
}

// Подсчет количества коэфициентов с начала массива до запрашиваемого коэфицента
// =======================================================
function stepCR(arr, cr) {
    if (arr) {
        if (arr.constructor === Array) {
            if (arr.length >= 1) {
                for (var i = 0; i < arr.length; i++) {
                    if (((arr[i] >= cr) && (arr[i] < (cr + 1))) || ((arr[i] >= cr) && (cr == 5))) {
                        return (i + 1);
                    }
                }
            }
        }
    }
    return -1;
}

// Поиск наиболее встречающегося элемента в массиве
// =======================================================
function mode(arr) {
    if (arr) {
        if (arr.constructor === Array) {
            if (arr.length < 1) {
                return -1;
            } else {
                var modeMap = {};
                var maxEl = arr[0], maxCount = 1;
                for (var i = 0; i < arr.length; i++) {
                    var el = arr[i];
                    if (modeMap[el] == null) {
                        modeMap[el] = 1;
                    } else {
                        modeMap[el]++;
                    }
                    if (modeMap[el] > maxCount) {
                        maxEl = el;
                        maxCount = modeMap[el];
                    }
                }
                if (maxCount == 1) {
                    return -1;
                }
                return maxEl;
            }
        }
    }
    return -1;
}
function StartGame() {
// Сбор данных до начала игры
// =======================================================
    function DataCollection(sample) {
        if (round < sample) {
            console.log("======Сбор данных======");
            console.log("Осталось сборать " + (sample - round));
            console.log(" ");
        } else {
            console.log("======Данные собраны включаем тактику GI======");
            console.log(" ");
            dataCollection = true;
            Strategy = "GI";
        }
    }
// Стратегия GI(1-10)
// =======================================================
    function GI() {
//        var GI_bet = Math.round(curBR * 0.01 / 1000);
        var GI_bet = 1;
        var GI_crash = parseFloat((Math.random() * 4 + 1.01).toFixed(2));
        console.log("Последние два коэфициента "+busts[0] +" / "+ busts[1]);
        if (lastGamePlay == "-LOST") {
            Strategy = "FLY";
            return Strategy;
        } else if ((busts[0] < 1.98) && (busts[1] < 1.98)) {
            console.log("======GI 2R======");
            console.log("   Ставка: " + GI_bet);
            console.log("   Коэфициент: " + GI_crash);
            console.log(" ");
            placeBet(GI_bet, GI_crash, false);
        } else {
            var arrL = busts;
            for (i = 5; i >= 2; i--) {
                console.log("Коэфициент "+i+" встрчается каждые "+stepMA(arrL, i)+" ходов и при этом, уже было сделано с момента последнего выпадания " + stepCR(arrL, i) + " ходов");
                var arrL = busts;
                var s_CR = stepCR(arrL, i);
                var arrL = busts;
                var s_MA = stepMA(arrL, i);
                if (((s_CR > 0) && (s_MA > 0)) && (s_CR > s_MA)) {
                    console.log("======GI CRASH/" + i + "======");
                    console.log("   Ставка: " + GI_bet);
                    console.log("   Коэфициент: " + i);
                    console.log(" ");
                    placeBet(GI_bet, i, false);
                    GI_betted = true;
                    break;
                }
                GI_betted = false;
            }
            if (!GI_betted) {
                console.log("======GI MODE======");
                console.log("   Ставка: " + GI_bet);
                console.log("   Коэфициент: " + mode(busts));
                console.log(" ");
                placeBet(GI_bet, mode(busts), false);
            }
        }

    }
// Стратегия FLY(1.05)
// =======================================================
    function FLY() {
        console.log("======FLY IS NOT DEFINED MODE======");
        console.log("======END GAME PLEASE======");
    }
// Стратегия PI(1.37)
// =======================================================
    function PI() {
        console.log("======PI IS NOT DEFINED MODE======");
        console.log("======END GAME PLEASE======");
    }
// Стратегия PlusCoup
// =======================================================
    function PlusCoup() {
        console.log("======PlusCoup IS NOT DEFINED MODE======");
        console.log("======END GAME PLEASE======");
    }
    if (!dataCollection) {
        DataCollection(10);
    } else {
        switch (Strategy) {
            case "GI":
                GI();
                break;
            case "FLY":
                FLY();
                break;
            case "PI":
                PI();
                break;
            case "PlusCoup":
                PlusCoup();
                break;
        }
    }
}