'use strict';

if (window.console) {
  console.log("Welcome to your Play application's JavaScript!");
}

var createGame = function() {

    var self = {};

    var run = function(fn) {
        if (self.$scope) {
            console.log("Running fn", fn);
            self.$scope.$apply(fn());
        } else {
            console.error("$scope not set in game");
        }
    };

    self.players = [];

    self.color = function(color) {
        return "rgb("+color.r+","+color.g+","+color.b+")";
    };

    function key(msg) {
        for (var k in msg)
            return k;
    }

    self.dispatch = function(msg) {
        run(function() {
            console.log("Dispatching", msg);
            var k = key(msg);
            var body = msg[k];
            switch (k) {
                case "PlayerJoined":
                    self.players.push(body.player);
                    break;
                case "PlayerList":
                    self.players = body.players;
                    break;
                case "PlayerUpdated":
                    for (var k in self.players) {
                      if (self.players[k].id.id == body.player.id.id)
                        self.players[k] = body.player
                    }
                    break;
                case "PlayerLeft":
                    for (var k in self.players) {
                      if (self.players[k].id.id == body.playerId.id) {
                        delete self.players[k];
                        break;
                      }
                    }
                    break;
                default:
                    console.log("Unknown command", k, body);
                    break;
            }
        });
    };

    return self;
};

var game = createGame();

// ANGULAR VIEWMODEL
var app = angular.module('agarApp', [])

app.value("game", game);

app.controller('AgarController', function($scope, game) {
  game.$scope = $scope; // init container for outside changes
  $scope.game = game;

  $scope.fieldClick = function(e) {
    console.log("click", e);

    var cmd = {
      "Move": { x: e.clientX, y: e.clientY }
    };

    ws.send(JSON.stringify(cmd));
  };

});

// WEBSOCKETS
var ws = new WebSocket("ws://"+window.location.host+"/ws");

ws.onopen = function (e) {
  console.log("Connected", e);
};

ws.onmessage = function (msg) {
    console.log("Received: ", msg);
    var message = JSON.parse(msg.data);
    console.log("Parsed to: ", message);
    game.dispatch(message);
};
