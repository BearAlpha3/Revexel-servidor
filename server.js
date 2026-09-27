const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;

const wss = new WebSocket.Server({
    port: PORT
});

let nextPlayerId = 1;

const players = new Map();

function enviarTodos(data, excluir = null) {
    const mensagem = JSON.stringify(data);

    for (const [ws] of players) {
        if (
            ws !== excluir &&
            ws.readyState === WebSocket.OPEN
        ) {
            ws.send(mensagem);
        }
    }
}

wss.on("connection", (ws) => {

    const id = String(nextPlayerId++);

    const player = {
        id: id,
        x: 640,
        y: 500
    };

    players.set(ws, player);

    // Envia ao novo jogador os jogadores que já estavam na sala
    const jogadoresAtuais = [];

    for (const [, outro] of players) {
        if (outro.id !== id) {
            jogadoresAtuais.push(outro);
        }
    }

    ws.send(JSON.stringify({
        type: "welcome",
        player: player,
        players: jogadoresAtuais
    }));

    // Avisa os outros que um jogador entrou
    enviarTodos({
        type: "player_join",
        player: player
    }, ws);

    ws.on("message", (data) => {

        try {

            const mensagem = JSON.parse(data.toString());

            const atual = players.get(ws);

            if (!atual) {
                return;
            }

            if (mensagem.type === "position") {

                if (
                    typeof mensagem.x !== "number" ||
                    typeof mensagem.y !== "number"
                ) {
                    return;
                }

                atual.x = mensagem.x;
                atual.y = mensagem.y;

                enviarTodos({
                    type: "player_position",
                    player: atual
                }, ws);
            }

        } catch (erro) {
            console.log("Mensagem inválida");
        }
    });

    ws.on("close", () => {

        const jogador = players.get(ws);

        if (!jogador) {
            return;
        }

        players.delete(ws);

        enviarTodos({
            type: "player_leave",
            id: jogador.id
        });
    });

    ws.on("error", () => {
        players.delete(ws);
    });

    console.log(
        "Jogador conectado:",
        id,
        " | jogadores:",
        players.size
    );
});

console.log(
    "REVEXEL multiplayer server iniciado na porta",
    PORT
);
