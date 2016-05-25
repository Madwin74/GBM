// ================================================================
var enableBetting = true;               // Режим ставок вкл/выкл
var baseBet = getBaseBet();             // Базовая ставка в битсах
var GI_bet = baseBet;                   // Базовая ставка GI в битсах
var PI_bet = baseBet;                   // Базовая ставка PI в битсах
var FLY_bet = baseBet;                  // Базовая ставка FLY в битсах
var FLY_crash = 10;                  // Базовая ставка FLY в битсах
var baseStop = 10;                      // Базовый % выигрыша для остановки
// ================================================================
var round = 0;                          // Раунд игры
var last;                               // Сыгравший коэфициент в предыдущей игре
// ================================================================
var cashedOut = true;                   // Коэфициент
// ================================================================
var lastGamePlay;                       // Результат предыдущей игры
var startBR = engine.getBalance();      // Изначальный банкролл
var maxBR = startBR;                    // Максимальный банкролл за игру
var minBR = startBR;                    // Минимальный банкролл за игру
var curBR = startBR;                    // Текущий банкролл
var userName = engine.getUsername();    // Имена текущих игроков
var gamesWon = 0;                       // Количество выиграных ставок
var gamesLost = 0;                      // Количество проигранных ставок
var unplayed = 0;                       // Количество пропущеных игр
var net = 0;                            // Профит
var loseGames = 0;                      // Череда проигрышей
var winGames = 0;                       // Череда выигрышей
var maxBet = 0;                         // Максимальная ставка за игру
var winProc = 0;                        // Выигрыш в процентах
var timeStart = Date.now();             // Время начала работы бота
var timeToMaxBet = 0;                   // Время максимальной ставки
var timeToloseGames = 0;                // Время максимальной череды неудач
var timeTowinGames = 0;                 // Время максимальной череды удач
// ================================================================
var busts = new Array();                // Массив сыгравших ставок
var losePeriods = new Array();          // Массив времен для проигрышей
var winsPeriods = new Array();          // Массив времен для выигрышей
// ================================================================
var dataCollection = false;             // Флаг сбора данных
var Strategy = false;                   // Стратегия
// ================================================================
var falseGames = 0;                     // Счетчик пропуска раундов
var wins = 0;                           // Счетчик выигрышей
var loses = 0;                          // Счетчик проигрышей
var procStop = baseStop;                // Счетчик % выигрыша для остановки
// ================================================================
var h = 0;                              // часы
var m = 0;                              // минуты
var s = 0;                              // секунды
var stopped = 0;                        // время остновки
// ================================================================
engine.on('game_starting', function (data) {
    StartGame();
});
// ================================================================
engine.on('game_started', function (data) {

});
// ================================================================
engine.on('game_crash', function (data) {
    console.clear();
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
function getTime(timeStop) {
    if (!timeStop) {
        var timeStop = Date.now();
    }
    var timer = new Date(timeStop - timeStart);
    h = (timer.getHours() - 3);
    m = (timer.getMinutes());
    s = (timer.getSeconds());
    return  h + ":" + m + ":" + s;
}
// ================================================================
function getBaseBet(proc) {
    if (!proc) {
        return 1;
    } else {
        return (Math.floor(engine.getBalance() / 100 / proc));
    }
}
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
                        cash = parseInt(cash * 100);
                        engine.placeBet(bet * 100, cash, autoCash);
                    }
                }
            }
        }
    }
}
// ================================================================
function getProc() {
    return ((net / (startBR / 100)).toFixed(2));
}
// ================================================================
function getWinsPeriod() {
    if (winsPeriods.length > 0) {
        return "\nСредний период стека выигрыша: " + getTime(median(winsPeriods));
    } else {
        return "";
    }
}
function getLosePeriod() {
    if (losePeriods.length > 0) {
        return "\nСредний период стека проигрыша: " + getTime(median(losePeriods));
    } else {
        return "";
    }
}
// ================================================================
function logRound() {
    var timer = getTime();
    var m1Busts = busts.slice();
    var m2Busts = busts.slice();
    var m3Busts = busts.slice();
    var botTitleStr = "Afodar's BustaBitBot\n";
    var timeStr = "\nВремя работы: " + getTime(false);
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
    var balanceProcStr = "\nВыиграно % от банкролла: " + getProc();
    var userNameStr = "\nАккаунт: " + userName;
    var gamesWonStr = "\nВыигано раудов: " + gamesWon;
    var gamesLostStr = "\nПроиграно раундов: " + gamesLost;
    var unplayedStr = "\nНе сыграно раундов: " + unplayed;
    var wonsStr = "\nЧереда выигрышей макс.: " + winGames + " [" + getTime(timeTowinGames) + "] назад";
    var lostsStr = "\nЧереда проигрышей макс.: " + loseGames + " [" + getTime(timeToloseGames) + "] назад";
    var maxBetStr = "\nМаксимальная ставка: " + maxBet + " [" + getTime(timeToMaxBet) + "] назад";
    var meanStr = "\nСредняя по коэфициентам: " + mean(m1Busts).toFixed(2);
    var medianStr = "\nЭкспоненциональная по коэфициентам: " + median(m2Busts).toFixed(2);
    var modeStr = "\nНаиболее часто играющий коэфициент: " + mode(m3Busts).toFixed(2);
    var netStr = "\nПрофит: " + net;
    console.log("\n" +
            botTitleStr +
            timeStr +
            enableBettingStr +
            baseBetStr +
            roundStr +
            lastStr +
            lastGamePlayStr +
            startBRStr +
            maxBRStr +
            minBRStr +
            curBRStr +
            balanceProcStr +
            userNameStr +
            gamesWonStr +
            gamesLostStr +
            unplayedStr +
            wonsStr +
            getWinsPeriod() +
            lostsStr +
            getLosePeriod() +
            maxBetStr +
            meanStr +
            medianStr +
            modeStr +
            netStr +
            "\n"
//            busts
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
                var sArr = stepsMA.sort();
                return mean(sArr);
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
                return -2;
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
                    return -3;
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
            console.log("======Данные собраны включаем тактику PI======");
            console.log(" ");
            dataCollection = true;
            Strategy = "FLY";
        }
    }
// Стратегия GI(1-10)
// =======================================================
    function GI() {
        lastGamePlay = engine.lastGamePlay();
        console.log("Последние два коэфициента " + busts[0] + " / " + busts[1]);
        if (lastGamePlay == "LOST") {
            GI_bet = GI_bet * 2;
            if (GI_bet > maxBet) {
                maxBet = GI_bet;
            }
            if (loseGames > 6) {
                loseGames = 0;
                GI_bet = baseBet;
            }
        } else if (lastGamePlay == "WON") {
            GI_bet = baseBet;
            loseGames = 0;
        }
        if ((busts[0] < 1.97) && (busts[1] < 1.97)) {
            falseGames++;
            if (falseGames > 3) {
                GI_crash = 0;
                for (i = 5; i >= 2; i--) {
                    var arrL = busts;
                    var s_CR = stepCR(arrL, i);
                    var arrL = busts;
                    var s_MA = stepMA(arrL, i);
                    if (((s_CR > 0) && (s_MA > 0)) && (s_CR > s_MA)) {
                        GI_crash = i;
                        break;
                    }
                }
                if (GI_crash > 0) {
                    console.log("======GI 2R======");
                    console.log("   Ставка: " + GI_bet);
                    console.log("   Коэфициент: " + GI_crash);
                    console.log(" ");
                    placeBet(GI_bet, GI_crash, false);
                }
                falseGames = 0;
            } else {
                console.log("Условие на 2 красных выполнено. Осталось дождаться ещё " + (3 - falseGames) + " совпадений данного условия.");
            }
        } else {
            console.log("Условие на 2 красных не выполнено. Ждем.");
        }
    }
// Стратегия FLY(1.05)
// =======================================================
    function FLY() {
        if (lastGamePlay == "LOST") {
            loses++;
            if (loses % 2) {
                FLY_bet++;
            }
            FLY_crash = FLY_crash + (0.3 + (loses / 100));
        } else if (lastGamePlay == "WON") {
            loses = 0;
            FLY_bet = 1;
            FLY_crash = 10;
        }
        placeBet(FLY_bet, FLY_crash, false);
    }
// Стратегия PI(1.37)
// =======================================================
    function PI() {
        if (lastGamePlay == "LOST") {
            var multiple = 2.3;
            loses++;
            if (loses > 3) {
                var t_s = (losePeriods.length > 0) ? losePeriods[0] : timeStart;
                var t_e = Date.now();
                losePeriods.push(t_e - t_s);
            }
            wins = 0;
            if (loses > loseGames) {
                loseGames = loses;
                timeToloseGames = Date.now();
            }
            if (loses > 4) {
                PI_bet = 1;
            } else {
                if (busts[0] != 0) {
                    PI_bet = Math.floor(PI_bet * multiple * busts[0]);
                } else {
                    PI_bet = Math.floor(PI_bet * 3);
                }
            }
            if (PI_bet > maxBet) {
                maxBet = PI_bet;
                timeToMaxBet = Date.now();
            }
        } else if (lastGamePlay == "WON") {
            wins++;
            if (wins > 3) {
                var t_s = (winsPeriods.length > 0) ? winsPeriods[0] : timeStart;
                var t_e = Date.now();
                winsPeriods.push(t_e - t_s);
            }
            if (wins > winGames) {
                winGames = wins;
                timeTowinGames = Date.now();
            }
            PI_bet = baseBet;
            loses = 0;
        }
        var PI_crash = 0;
        var m1Busts = busts.slice();
        var m2Busts = busts.slice();
        var m3Busts = busts.slice();
        var sa = parseFloat(mean(m1Busts).toFixed(2));
        var se = parseFloat(median(m2Busts).toFixed(2));
        var chi = parseFloat(mode(m3Busts).toFixed(2));
        if (sa > 0 && se > 0 && chi > 0) {
            if ((se * 2 < sa) && (se > chi) && (se > 1.1)) {
                if (getProc() > procStop && lastGamePlay != "LOST") {
                    if (stopped == 0) {
                        stopped = Date.now() + parseInt(Math.random() * 10800000 + 1);
                    }
                    var lastTime = new Date(stopped - Date.now());
                    if (lastTime > 0) {
                        console.log("======PI T1======");
                        console.log("Игра окончена. Следующий старт игры через [" + getTime(lastTime) + "]");
                        console.log(" ");
                    } else {
                        stopped = 0;
                        procStop += baseStop;
                    }
                }
                PI_crash = parseFloat(((Math.random() * (se - chi)) + chi).toFixed(2));
                console.log("======PI T1======");
                console.log("   Ставка: " + PI_bet);
                console.log("   Коэфициент: " + PI_crash);
                console.log(" ");
                placeBet(PI_bet, PI_crash, false);
            }
            console.log("======PI T1======");
            console.log("   SA: " + sa);
            console.log("   SE: " + se);
            console.log("   CHI: " + chi);
            console.log(" ");
        } else {
            console.log("======PI T1======");
            console.log("   SA: " + sa);
            console.log("   SE: " + se);
            console.log("   CHI: " + chi);
            console.log(" ");
        }
    }
// Стратегия PlusCoup
// =======================================================
    function PlusCoup() {
        console.log("======PlusCoup IS NOT DEFINED MODE======");
        console.log("======END GAME PLEASE======");
    }
    if (!dataCollection) {
        DataCollection(0);
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