class Game {

    constructor(id, canvas, item, type) {
        this.id = id
        this.canvas = canvas
        this.item = item
        this.type = type

        this.context = this.canvas.getContext("2d");
        this.players = {}
        this.uplayers = {}
        this.delay = 0

        this.delta = 0
        this.lastFrameTimeMs = 0

        this.sendDelta = 0
        this.lastSendDelta = 0

        this.eventDelta = 0
        this.lastEventDelta = 0

        this.uDelta = 0
        this.lastUpdateDelta = 0
        this.uChange = false

        this.isLeft = false
        this.isRight = false
        this.isUp = false
        this.isDown = false

        this.eventChange = false
        this.isInitialized = false


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

        this.lastEventDelta = this.lastFrameTimeMs;
        this.eventChange = true

        console.log(this.eventDelta, servers[this.type].isEventBased, this.eventChange);
        console.log(servers[this.type]);
    }

    setDelay(delay) {
        console.log(delay.target.value)
        this.delay = parseInt(delay.target.value)
    }

    updatePlayers(players) {
        if(Object.keys(servers).length < 2) return
        
        if(!(this.id in this.players) || Object.keys(players).length != Object.keys(this.players).length) {
            //console.log(servers);
            for(const id in players) {
                let player = new Player(id);
                player.setColor(players[id].color);
                player.setPosition(players[id].posx, players[id].posy);
                player.lastx = players[id].posx
                player.lasty = players[id].posy
                
                this.players[id] = player
            }

            for(const id in this.players) {
                if(!(id in players)) delete this.players[id]
            }
        }
        else if(this.uChange == false) {
            this.lastUpdateDelta = this.lastFrameTimeMs;
            this.uplayers = players;
            this.uChange = true; 
        }     
    }

    gameLoop(timestamp) {
        
        this.delta = timestamp - this.lastFrameTimeMs;
        this.lastFrameTimeMs = timestamp;

        this.sendDelta = timestamp - this.lastSendDelta;

        this.eventDelta = timestamp - this.lastEventDelta;

        this.uDelta = timestamp - this.lastUpdateDelta;
        //console.log(this.lastUpdateDelta);

        if(Object.keys(this.players).length > 0) {
            this.draw();
            this.localUpdate(this.delta);

            if(this.eventDelta > this.delay && servers[this.type].isEventBased && this.eventChange) {
                //console.log("sending event update");
                servers[this.type].updatePlayerInput(this.id, [this.isLeft, this.isRight, this.isUp, this.isDown])
                this.lastEventDelta = timestamp
                this.eventChange = false
            }

            //console.log(servers[this.type].clientUpdateRate + this.delay)
            if(this.sendDelta > (servers[this.type].clientUpdateRate + this.delay) 
                && servers[this.type].isEventBased == false 
                && this.players[this.id]
            ) {
                //console.log("sending player position " + this.id)
                servers[this.type].updatePlayerPosition(this.id, this.players[this.id])
                this.lastSendDelta = timestamp
            }

            if(this.uDelta > this.delay && this.uChange) {
                //console.log("updating player")
                for(const id in this.uplayers) {
                    if(servers[this.type].isEventBased == false && id == this.id) { continue }
                    let player = new Player(id);
                    player.setColor(this.uplayers[id].color);
                    player.setPosition(this.uplayers[id].posx, this.uplayers[id].posy);

                    player.lastx = this.players[id].posx;
                    player.lasty = this.players[id].posy;

                    let inputs = this.calculateLastMovement(player)

                    player.isLeft = inputs[0]
                    player.isRight = inputs[1]
                    player.isUp = inputs[2]
                    player.isDown = inputs[3]

                    this.players[id] = player
                }
                
                this.lastUpdateDelta = timestamp
                this.uChange = false
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
            
            if(!servers[this.type].hasClientPrediction || this.id == id) {
                this.context.fillRect(player.posx, player.posy, 20, 20);
            }
            else {
                this.context.fillRect(player.lastx, player.lasty, 20, 20);
            }
        }
    }

    calculateLastMovement(p) {
        let isLeft = p.lastx > p.posx && Math.abs(p.lastx - p.posx) > 20
        let isRight = p.lastx < p.posx && Math.abs(p.lastx - p.posx) > 20
        let isUp = p.lasty > p.posy && Math.abs(p.lasty - p.posy) > 20
        let isDown = p.lasty < p.posy && Math.abs(p.lasty - p.posy) > 20

        return [isLeft, isRight, isUp, isDown]
    }

    localUpdate(delta) {
        //console.log(servers[this.type].hasClientPrediction)

        if(servers[this.type].hasClientPrediction) {
            var updateDelta = (servers[this.type].clientUpdateRate + this.delay) / 1000
            if(servers[this.type].isEventBased == false) updateDelta = (servers[this.type].clientUpdateRate + this.delay) / 50

            for(const id in this.players) {
                if(id == this.id) { continue }

                if(Math.abs(this.players[id].posx - this.players[id].lastx) > 1) {
                    if(this.players[id].lastx > this.players[id].posx) {
                        this.players[id].lastx -= hSpeed * updateDelta * delta
                    }
                    if(this.players[id].lastx < this.players[id].posx) {
                        this.players[id].lastx += hSpeed * updateDelta * delta
                    }
                }

                if(Math.abs(this.players[id].posy - this.players[id].lasty) > 1) {
                    if(this.players[id].lasty > this.players[id].posy) {
                        this.players[id].lasty -= vSpeed * updateDelta * delta
                    }
                    if(this.players[id].lasty < this.players[id].posy) {
                        this.players[id].lasty += vSpeed * updateDelta * delta
                    }
                }

            }
        }

        if(this.isLeft && this.isRight == false) {
            this.players[this.id].posx -= hSpeed * delta
            if(this.players[this.id].posx < -20) {
                this.players[this.id].posx = 220 - hSpeed * delta
            }
        }
        else if(this.isRight && this.isLeft == false) {
            this.players[this.id].posx += hSpeed * delta
            if(this.players[this.id].posx > 220) {
                this.players[this.id].posx = -20 + hSpeed * delta
            }
        }

        if(this.isUp && this.isDown == false) {
            this.players[this.id].posy -= vSpeed * delta
            if(this.players[this.id].posy < -20) {
                this.players[this.id].posy = 220 - vSpeed * delta
            }
        }
        else if(this.isDown && this.isUp == false) {
            this.players[this.id].posy += vSpeed * delta
            if(this.players[this.id].posy > 220) {
                this.players[this.id].posy = -20 + vSpeed * delta
            }
        }
    }
}