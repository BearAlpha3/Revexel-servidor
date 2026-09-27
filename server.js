const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
        status: "online",
        game: "REVEXEL"
    }));
});

server.listen(PORT, () => {
    console.log(`REVEXEL server online na porta ${PORT}`);
});
