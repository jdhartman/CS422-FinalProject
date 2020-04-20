let colors = ["#FFAD54", "#F9FF61", "#FE4750", "#2EC7FF", "#A747FF"]
const MOVE = {
    LEFT: "left",
    RIGHT: "right",
    UP: "up",
    DOWN: "down"
}

var clientUpdateRate = 2000;
let hSpeed = .1
let vSpeed = .1

class Server {

    constructor(type, div, list) {
        this.games = {}
        this.players = {}
        this.type = type
        this.div = div
        this.list = list
        this.updateRate = 1000
        this.delta = 0
        this.lastFrameTimeMs = 0

        this.createTitle()
        this.createButtons()

        if (this.type == SERVER_TYPE.CLIENT_SERVER) {
            this.createText("Server State");
            this.server = this.createServerCanvas()
            this.createText("Clients");
            this.serverContext = this.server.getContext("2d");
        }

        this.div.appendChild(this.list);

        this.gameLoop()
    }

    createTitle() {
        let title = (this.type == SERVER_TYPE.CLIENT_SERVER) ? "Client Server Architecture" : "Peer to Peer Architecture";
        this.createText(title);
    }

    createText(text) {
        let textNode = document.createTextNode(text);
        let titleElement = document.createElement("h3");

        titleElement.appendChild(textNode);

        this.div.appendChild(titleElement);
    }

    createButtons() {
        var plus = document.createTextNode("+");

        var addGameButton = document.createElement("BUTTON");
        addGameButton.onclick = () => { this.addGame() }
        addGameButton.appendChild(plus);

        this.div.appendChild(addGameButton);

        var minus = document.createTextNode("-");

        var removePlayerButton = document.createElement("BUTTON");
        removePlayerButton.onclick =() => { this.removeGame() }
        removePlayerButton.appendChild(minus);
        
        this.div.appendChild(removePlayerButton)
        this.div.style.border = "thick solid #0000FF";
        this.div.style.width = window.innerWidth / 2 + "px";
    }

    addGame() {
        let canvas = this.createCanvas();
        let gameID = createUUID()
        var item = document.createElement("li");
        item.style.display = "inline-block";
        item.style.minHeight = "150px";
        item.style.padding = "5px";

        var canvasDiv = document.createElement("div");
        var buttonDiv = document.createElement("div");
        var delayDiv = document.createElement("div");

        let game = new Game(gameID, canvas, item, this.type);
        this.games[gameID] = game

        canvasDiv.appendChild(canvas);

        buttonDiv.appendChild(this.createInputs(game, MOVE.LEFT));
        buttonDiv.appendChild(this.createInputLabel(game, MOVE.LEFT));

        buttonDiv.appendChild(this.createInputs(game, MOVE.RIGHT));
        buttonDiv.appendChild(this.createInputLabel(game, MOVE.RIGHT));

        buttonDiv.appendChild(this.createInputs(game, MOVE.UP));
        buttonDiv.appendChild(this.createInputLabel(game, MOVE.UP));

        buttonDiv.appendChild(this.createInputs(game, MOVE.DOWN));
        buttonDiv.appendChild(this.createInputLabel(game, MOVE.DOWN));

        delayDiv.appendChild(this.createDelayInputLabel(game));
        delayDiv.appendChild(this.createDelayInput());

        item.appendChild(canvasDiv);
        item.appendChild(buttonDiv);
        item.appendChild(delayDiv);

        this.list.appendChild(item);

        this.addPlayer(new Player(gameID));
    }

    removeGame() {
        let id = Object.keys(this.games)[Object.keys(this.games).length - 1];
        this.games[id].canvas.remove();
        this.games[id].item.remove();
        delete this.games[id];
        this.removePlayer(id);   
    }

    addPlayer(player) {
        let l = Object.keys(this.players).length;

        player.setColor(colors[l]);
        console.log(player)

        this.players[player.id] = player;
        this.players[player.id].setPosition(10 + (40 * l % 200), 10 + (40 * Math.round(40 * l / 400)));

        console.log(this.players)

        for(const id in this.games) {
            this.games[id].updatePlayers(this.players);
        }
    }

    removePlayer(id) {
        delete this.players[id]

        for(const id in this.games) {
            this.games[id].updatePlayers(this.players);
        }
    }

    createCanvas() {
        var canvas = document.createElement("CANVAS");
        var context = canvas.getContext("2d");
    
        canvas.width = 200;
        canvas.height = 200;
        canvas.style.border = "thin solid #000000";
    
        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, 200, 200);
    
        return canvas
    }

    createInputs(game, bType) {
        var check = document.createElement("input");
        check.id = game.id + "-" + bType
        check.style.marginBottom = "15px";
        check.title = "Button";
        check.setAttribute("type", "checkbox");

        check.addEventListener("change", (val) => {game.buttonChange(bType, val)});

        return check
    }

    createInputLabel(id, bType) {
        var label = document.createElement("label");
        label.htmlFor = id + "-" + bType;
        label.innerHTML = bType;
        label.style.paddingLeft = "5px";

        return label
    }

    createDelayInput() {
        var delay = document.createElement("input");
        delay.setAttribute("type", "number");
        delay.style.width = "50px";
        delay.style.marginLeft = "15px";
        delay.value = 0;

        return delay
    }

    createDelayInputLabel(id) {
        var label = document.createElement("label");
        label.htmlFor = id + "-delay";
        label.innerHTML = "ping in ms:";

        return label
    }

    createServerCanvas() {
        let canvas = this.createCanvas();

        this.div.appendChild(canvas);

        return canvas
    }

    gameLoop(timestamp) {
        
        this.delta = timestamp - this.lastFrameTimeMs;

        if(this.serverContext) {
            if(this.delta > this.updateRate) {
                this.lastFrameTimeMs = timestamp;
                this.update();
            }
            this.draw();
        }
    
        window.requestAnimationFrame((t) => this.gameLoop(t));
    }

    draw() {
        this.serverContext.fillStyle = "#FFFFFF";
        this.serverContext.fillRect(0, 0, 200, 200);

        for(const id in this.players) {
            let player = this.players[id];

            this.serverContext.fillStyle = player.color;
            this.serverContext.fillRect(player.posx, player.posy, 20, 20);
        }
    }

    update() {
        console.log("server updated");
        //for(const id in this.players) {
            //this.players[id].setPosition(this.games[id].players[id].posx, this.games[id].players[id].posy)
        //}
    }

    updatePlayer(id, h, v, delta) {
        this.players[id].setPosition(h * hSpeed * delta, v * vSpeed * delta)
    }
}