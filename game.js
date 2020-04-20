class Game {

    constructor(id, canvas, item, type) {
        this.id = id
        this.canvas = canvas
        this.item = item
        this.type = type

        this.context = this.canvas.getContext("2d");
        this.players = {}
        this.delay = 0

        this.delta = 0
        this.lastFrameTimeMs = 0

        this.sendDelta = 0
        this.lastSendDelta = 0

        this.isLeft = false
        this.isRight = false
        this.isUp = false
        this.isDown = false

        this.gameLoop();
    }

    buttonChange(bType, val) {
        console.log("Button Change : " + bType + " , " + val.target.checked);
        let switched = val.target.checked;
        console.log(switched)
        switch(bType) {
            case MOVE.LEFT: {
                this.isLeft = switched
                break
            }
            case MOVE.RIGHT: {
                this.isRight = switched
                break
            }
            case MOVE.UP: {
                this.isUp = switched
                break
            }
            case MOVE.DOWN: {
                this.isDown = switched
                break
            }
        }
    }

    setDelay(delay) {
        this.delay = delay
    }

    updatePlayers(players) {
        for(const id in players) {
            let player = new Player(id);
            player.setColor(players[id].color);
            player.setPosition(players[id].posx, players[id].posy);

            this.players[id] = player
        }
        console.log(this.players);
    }

    gameLoop(timestamp) {
        
        this.delta = timestamp - this.lastFrameTimeMs;
        this.lastFrameTimeMs = timestamp;

        this.sendDelta = timestamp - this.lastSendDelta;

        if(Object.keys(this.players).length > 0) {
            this.localUpdate(this.delta);
            this.draw();

            if(this.sendDelta > clientUpdateRate) {
                this.lastSendDelta = timestamp
                this.update();
            }
        }
    
        window.requestAnimationFrame((t) => this.gameLoop(t));
    }

    draw() {
        this.context.fillStyle = "#FFFFFF";
        this.context.fillRect(0, 0, 200, 200);

        for(const id in this.players) {
            let player = this.players[id];

            this.context.fillStyle = player.color;
            this.context.fillRect(player.posx, player.posy, 20, 20);
        }
    }

    localUpdate(delta) {
        //console.log(delta)

        if(this.isLeft && this.isRight == false) {
            this.players[this.id].posx -= hSpeed * delta
            if(this.players[this.id].posx < -20) {
                this.players[this.id].posx = 220
            }
        }
        else if(this.isRight && this.isLeft == false) {
            this.players[this.id].posx += hSpeed * delta
            if(this.players[this.id].posx > 220) {
                this.players[this.id].posx = -20
            }
        }

        if(this.isUp && this.isDown == false) {
            this.players[this.id].posy -= vSpeed * delta
            if(this.players[this.id].posy < -20) {
                this.players[this.id].posy = 220
            }
        }
        else if(this.isDown && this.isUp == false) {
            this.players[this.id].posy += vSpeed * delta
            if(this.players[this.id].posy > 220) {
                this.players[this.id].posy = -20
            }
        }
    }
    
    update(delta) {
        console.log("game update")
        var inputs = [this.isLeft, this.isRight, this.isUp, this.isDown]
        switch(this.type) {
            case SERVER_TYPE.CLIENT_SERVER: {
                cs_server.updatePlayer(this.id, inputs, delta)
                break
            }
            case SERVER_TYPE.PEER_2_PEER: {
                p2p_server.updatePlayer(this.id, input, delta)
                break
            }
        }
    }
}