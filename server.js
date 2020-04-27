let colors = ["#FFAD54", "#F9FF61", "#FE4750", "#2EC7FF", "#A747FF"]
const MOVE = {
    LEFT: "left",
    RIGHT: "right",
    UP: "up",
    DOWN: "down"
}

let hSpeed = .1
let vSpeed = .1

class Server {

    constructor(type, div, list) {
        this.games = {}
        this.players = {}
        this.type = type
        this.div = div
        this.list = list
        this.updateRate = 100
        this.clientUpdateRate = 1000
        this.isEventBased = true
        this.hasClientPrediction = true
        
        this.delta = 0
        this.lastFrameTimeMs = 0

        this.sendDelta = 0
        this.lastSendDelta = 0

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
        delayDiv.appendChild(this.createDelayInput(game));

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

    createDelayInput(game) {
        var delay = document.createElement("input");
        delay.id = "ping-" + game.id
        delay.setAttribute("type", "number");
        delay.style.width = "50px";
        delay.style.marginLeft = "15px";
        delay.value = 0;

        delay.addEventListener("change", (val) => {game.setDelay(val)})

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

        let updateLabel = document.createElement("label");
        updateLabel.htmlFor = "update-" + this.type
        updateLabel.innerHTML = "Server update rate in ms:";
        updateLabel.style.display = "block";

        this.div.appendChild(updateLabel)

        let updateInput = document.createElement("input");
        updateInput.id = "update-" + this.type
        updateInput.setAttribute("type", "number");
        updateInput.value = 100;

        updateInput.style.display = "block";

        updateInput.addEventListener("change", (val) => {this.updateRate = val.target.value})

        this.div.appendChild(updateInput);

        let clientRateLabel = document.createElement("label");
        clientRateLabel.htmlFor = "clientUpdateRate-" + this.type
        clientRateLabel.innerHTML = "Client update rate in ms:";

        this.div.appendChild(clientRateLabel)

        let clientRateInput = document.createElement("input");
        clientRateInput.id = "update-" + this.type
        clientRateInput.setAttribute("type", "number");
        clientRateInput.disabled = true
        clientRateInput.value = 1000;

        clientRateInput.style.display = "block";

        clientRateInput.addEventListener("change", (val) => {this.clientUpdateRate = val.target.value})

        this.div.appendChild(clientRateInput);

        let eventCheck = document.createElement("input");
        eventCheck.id = "eventcheck-" + this.type
        eventCheck.checked = true
        eventCheck.setAttribute("type", "checkbox");

        eventCheck.addEventListener("change", (val) => {
            clientRateInput.disabled = val.target.checked
            this.isEventBased = val.target.checked
        });

        this.div.appendChild(eventCheck)

        let checkLabel = document.createElement("label");
        checkLabel.htmlFor = "eventcheck-" + this.type
        checkLabel.innerHTML = "Event Based";

        this.div.appendChild(checkLabel)

        let clientCheck = document.createElement("input");
        clientCheck.id = "clientpredict-" + this.type
        clientCheck.checked = true
        clientCheck.setAttribute("type", "checkbox");

        clientCheck.addEventListener("change", (val) => {
            this.hasClientPrediction = val.target.checked
        });

        this.div.appendChild(clientCheck)

        let clientLabel = document.createElement("label");
        clientLabel.htmlFor = "clientpredict-" + this.type
        clientLabel.innerHTML = "Client Prediction";

        this.div.appendChild(clientLabel)

        return canvas
    }

    gameLoop(timestamp) {
        
        this.delta = timestamp - this.lastFrameTimeMs;
        this.lastFrameTimeMs = timestamp;

        this.sendDelta = timestamp - this.lastSendDelta;

        if(this.serverContext) {
            if(this.sendDelta > this.updateRate) {
                this.lastSendDelta = timestamp
                this.sendUpdate();
            }
            this.localUpdate(this.delta);
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

    sendUpdate() {
        for(const id in this.players) {
            this.games[id].updatePlayers(this.players)
        }
    }

    localUpdate(delta) {
       //console.log("server updated");
        if(this.isEventBased) {
            for(const id in this.players) {
                let p = this.players[id]
    
                if(p.isLeft && p.isRight == false) {
                    p.posx -= hSpeed * delta
                    if(p.posx < -20) {
                        p.posx = 220 - hSpeed * delta
                    }
                }
                else if(p.isRight && p.isLeft == false) {
                    p.posx += hSpeed * delta
                    if(p.posx > 220) {
                        p.posx = -20 + hSpeed * delta
                    }
                }
    
                if(p.isUp && p.isDown == false) {
                    p.posy -= vSpeed * delta
                    if(p.posy < -20) {
                        p.posy = 220 - vSpeed * delta
                    }
                }
                else if(p.isDown && p.isUp == false) {
                    p.posy += vSpeed * delta
                    if(p.posy > 220) {
                        p.posy = -20 + vSpeed * delta
                    }
                }
            }
        }
    }

    updatePlayerPosition(id, player) {
        this.players[id].setPosition(player.posx, player.posy)
    }

    updatePlayerInput(id, inputs, delta) {
        console.log("update player input");
        this.players[id].isLeft = inputs[0]
        this.players[id].isRight = inputs[1]
        this.players[id].isUp = inputs[2]
        this.players[id].isDown = inputs[3]
    }
}