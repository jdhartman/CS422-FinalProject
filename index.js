document.body.onload = init;

const SERVER_TYPE = {
    PEER_2_PEER: "p2p",
    CLIENT_SERVER: "cs"
}

var servers = {};
var cs_server, cs_div;
var p2p_server, p2p_div;

function init() {
    document.body.style.display = "flex";

    cs_div = createContainer(SERVER_TYPE.CLIENT_SERVER)
    console.log(cs_div);
    cs_server = createServer(SERVER_TYPE.CLIENT_SERVER, cs_div[0], cs_div[1]);
    console.log(cs_server);

    p2p_div = createContainer(SERVER_TYPE.PEER_2_PEER)
    p2p_server = createServer(SERVER_TYPE.PEER_2_PEER, p2p_div[0], p2p_div[1]);
    console.log(p2p_server);

    servers[SERVER_TYPE.CLIENT_SERVER] = cs_server;
    servers[SERVER_TYPE.PEER_2_PEER] = p2p_server;
}

function createContainer(id) {
    let div = document.createElement("div");

    var list = document.createElement("ul");
    list.id = id;
    list.style.listStyleType = "none";
    list.style.flexWrap = "wrap";
    list.style.maxWidth = "800px";

    document.body.appendChild(div);

    return [div, list]
}

function createServer(id, div, list) {
    let server = new Server(id, div, list);
    
    server.addGame()

    return server
}
