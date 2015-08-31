'use strict';

if (window.console) {
    console.log("Welcome to your Play application's JavaScript!");
}

function dotProduct(a, b) {
    return a.x * b.x + a.y * b.y;
}

function length(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

var createGame = function () {

    var self = {};

    var run = function (fn) {
        if (self.$scope) {
            self.$scope.$apply(fn());
        } else {
            console.error("$scope not set in game");
        }
    };

    self.screen = {w: 400, h: 400};

    self.angle = function(p) {
        var a = angle({x: 0, y:0}, p.speed);
        return a * 180 / 3.141952;
    };

    self.players = [];

    function firstKey(msg) {
        for (var kk in msg)
            return kk;
    }

    function findKey(arr, fn) {
        for (var i in arr) {
            if (fn(arr[i])) return i;
        }
        return -1;
    }

    function find(arr, fn) {
        var idx = findKey(arr, fn);
        if (idx != -1) return arr[idx];
    }

    self.handlers = {};

    self.on = function (messageName, handler) {
        self.handlers[messageName] = handler;
    };

    self.dispatch = function (msg) {
        run(function () {
            console.log("Dispatching", msg);
            var k = firstKey(msg);
            var handler = self.handlers[k];

            if (handler) {
                handler(msg[k]);
            } else {
                console.error("Handler for " + k + " not found.");
            }
        })
    };

    self.on("PlayerIdentity", function (body) {
        self.playerId = body.id.id;
    });

    self.on("PlayerJoined", function (body) {
        self.players.push(body.player);
    });

    self.on("PlayerList", function (body) {
        self.players = body.players;
        self.player = find(self.players, function (e) {
            return (e.id.id == self.playerId);
        });
        self.start();
    });

    self.on("PlayerUpdated", function (body) {
        var updatedKey = findKey(self.players, function (e) {
            return e.id.id == body.player.id.id
        });
        self.players[updatedKey] = body.player;
    });

    self.on("PlayerLeft", function (body) {
        var leftKey = findKey(self.players, function (e) {
            return e.id.id == body.playerId.id
        });
        self.players.splice(leftKey, 1);
    });

    self.sendCommand = function (cmd) {
        var strCommand = JSON.stringify(cmd);
        console.log(strCommand);
        ws.send(strCommand);
    };

    function screenToMath(pageCoords) {
        var gameField = document.getElementById("game-field");

        var screenX = pageCoords.x - gameField.offsetLeft;
        var screenY = pageCoords.y - gameField.offsetTop;

        var realX = screenX / self.screen.w;
        var realY = screenY / self.screen.h;

        return {x: realX, y: realY};
    }

    // between (0, 1) and line from 2 points(from, to)
    function angle(from, to) {
        return Math.atan2(to.y - from.y, to.x - from.x) - Math.atan2(0, 1);
    }

    function angle2(a, b) {
        //return Math.atan2(b.x - a.x, b.y - a.y);
        var sin = a.x * b.y - b.x * a.y;
        var cos = a.x * b.x + a.y * b.y;
        return Math.atan2(sin, cos);
    }

    self.fieldClick = function (e) {
        console.log("click", e);

        self.player.position = screenToMath({x: e.pageX, y: e.pageY});

        //self.sendCommand({
        //    "Move": {
        //        x: realX,
        //        y: realY
        //    }
        //});
    };

    function rotate(v, theta) {
        var cs = Math.cos(theta);
        var sn = Math.sin(theta);

        return {
            x: v.x * cs - v.y * sn,
            y: v.x * sn + v.y * cs
        };
    }

    function length(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    function dist(a, b) {
        return length({x: a.x - b.x, y: a.y - b.y});
    }

    function normalize(v) {
        var len = length(v);
        return { x: v.x / len, y: v.y / len };
    }

    function scale(v, k) {
        return { x: v.x * k, y: v.y * k };
    }

    self.fieldMouseMove = function (e) {
        var from = self.player.position;
        var to = screenToMath({x: e.pageX, y: e.pageY});

        if (dist(from, to) > self.player.size) {
            // TODO: precalc speedLen to avoid accumulating floating error
            var speedLen = length(self.player.speed);
            var v = normalize({x: to.x-from.x, y: to.y-from.y});
            self.player.speed = scale(v, speedLen);
        }
    };

    self.start = function() {
        var fps = 25;
        var delay = 1000 / fps; // ms

        function updateWorld() {
            run(function() {
                // TODO: check real time passed since last call with moment.js
                // assume it's always `delay` atm
                self.players.forEach(function(p) {
                    if ((p.position.x + p.size < 1 && p.speed.x > 0) || (p.position.x - p.size > 0 && p.speed.x < 0)) {
                        p.position.x += p.speed.x * delay / 1000;
                    }

                    if ((p.position.y + p.size < 1 && p.speed.y > 0) || (p.position.y - p.size > 0 && p.speed.y < 0)) {
                        p.position.y += p.speed.y * delay / 1000;
                    }
                });
            });

            self.sendCommand({
                "Update": {
                    position: self.player.position,
                    speed: self.player.speed
                }
            });
        }

        setInterval(updateWorld, delay);
    };

    return self;
};

var game = createGame();

// ANGULAR VIEWMODEL
var app = angular.module('agarApp', []);

app.value("game", game);

app.controller('AgarController', function ($scope, game) {
    game.$scope = $scope; // init container for outside changes
    $scope.game = game;

    $scope.fieldMouseMove = function (e) {
        game.fieldMouseMove(e);
    };

    $scope.fieldClick = function (e) {
        game.fieldClick(e);
    };

});

// WEBSOCKETS
var ws = new WebSocket("ws://" + window.location.host + "/ws");

ws.onopen = function (e) {
    console.log("Connected", e);
};

ws.onmessage = function (msg) {
    console.log("Received: ", msg);
    var message = JSON.parse(msg.data);
    console.log("Parsed to: ", message);
    game.dispatch(message);
};
