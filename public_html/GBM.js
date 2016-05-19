// ================================================================
var enableBetting = false;              // режим ставок вкл/выкл
var baseBet = 0;                        // базовая ставка в битсах
// ================================================================
var round = 0;                          // Раунд игры
var last;                               // Сыгравший коэфициент в предыдущей игре
// ================================================================
var cashedOut = true; // Коэфициент
// ================================================================
var lastGamePlay = engine.lastGamePlay(); // Результат предыдущей игры
var startBR = engine.getBalance();      // Изначальный банкролл
var maxBR = startBR;                    // Максимальный банкролл за игру
var minBR = startBR;                    // Минимальный банкролл за игру
var curBR = startBR;                    // Текущий банкролл
var userName = engine.getUsername();    // Имена текущих игроков
var gamesWon = 0;                       // Количество выиграных ставок
var gamesLost = 0;                      // Количество проигранных ставок
var unplayed = 0;                       // Количество пропущеных игр
var net = 0;
// ================================================================
var busts = new Array();
var cashOutBustRounds = new Array();
// ================================================================
engine.on('game_starting', function (data) {

});
// ================================================================
engine.on('game_started', function (data) {

});
// ================================================================
engine.on('game_crash', function (data) {
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
                        engine.placeBet(bet * 100, cash * 100, autoCash);
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
    var lastStr = "\nСыгралов предыдущей игре: " + last;
    // ================================================================
    var cashedOutStr = "\nКоэфициент: " + cashedOut;
    var lastGamePlayStr = "\nПредыдущая игра: " + lastGamePlay;
    var startBRStr = "\nСтартовый банкролл: " + startBR;
    var maxBRStr = "\nМаксимальный банкролл: " + maxBR;
    var minBRStr = "\nМинимальный банкролл: " + minBR;
    var curBRStr = "\nТекущий банкролл: " + curBR;
    var userNameStr = "\nАккаунт: " + userName;
    var gamesWonStr = "\nВыигано раудов: " + gamesWon;
    var gamesLostStr = "\nПроиграно раундов: " + gamesLost;
    var unplayedStr = "\nНе сыграно раундов: " + unplayed;
    var netStr = "\nСеть: " + net;
    console.log("\n\n" +
            botTitleStr +
            enableBettingStr +
            baseBetStr +
            roundStr +
            lastStr +
            cashedOutStr +
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
    var dataCollection;
    var GI;
    var FLY;
    var PI;
    var PlusCoup;
// Сбор данных до начала игры
// =======================================================
    function DataCollection(sample) {
        if (round < sample) {

        } else {

        }
    }
// Стратегия GI(1-10)
// =======================================================
    function GI() {

    }
// Стратегия FLY(1.05)
// =======================================================
    function FLY() {

    }
// Стратегия PI(1.37)
// =======================================================
    function PI() {

    }
// Стратегия PlusCoup
// =======================================================
    function PlusCoup() {

    }
}