<?php
require dirname(__DIR__) . '/vendor/autoload.php';

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class SeegaServer implements MessageComponentInterface {
    protected $clients;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        echo "Servidor WebSocket iniciado...\n";
    }

    // public function onOpen(ConnectionInterface $conn) {
    //     $this->clients->attach($conn);
    //     echo "Nova conexão: {$conn->resourceId}\n";
    // }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "Nova conexão: {$conn->resourceId}\n";

        // Conta quantos estão conectados
        $total = count($this->clients);

        // Informa todos os clientes do número de conexões
        foreach ($this->clients as $client) {
            $client->send(json_encode([
                "type" => "status",
                "connected" => $total
            ]));
        }
    }


    public function onMessage(ConnectionInterface $from, $msg) {
                
        foreach ($this->clients as $client) {
            $client->send($msg);
            echo "Enviou a mensagem: {$msg}".PHP_EOL;
        }
    }

    // public function onClose(ConnectionInterface $conn) {
    //     $this->clients->detach($conn);
    //     echo "Conexão fechada: {$conn->resourceId}\n";
    // }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        echo "Conexão fechada: {$conn->resourceId}\\n";

        // Avisar a quem restou
        foreach ($this->clients as $client) {
            $client->send(json_encode([
                "type" => "player_disconnected"
            ]));
        }
    }


    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Erro: {$e->getMessage()}\n";
        $conn->close();
    }
}

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new SeegaServer()
        )
    ),
    8080
);

$server->run();
