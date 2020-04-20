class Player {

    constructor(id) {
        this.id = id
        this.posx = 0
        this.posy = 0;
        this.color = "#FFFFF";
    }

    setPosition(x, y) {
        this.posx = x;
        this.posy = y;

        console.log(this.posx, this.posy)
    }

    setColor(color) {
        this.color = color;
    }
}