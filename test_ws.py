import websocket # type: ignore

def test_ws(url, origin):
    print(f"Connecting to {url} with Origin: {origin}")
    try:
        ws = websocket.create_connection(url, origin=origin, timeout=5)
        print("Connected successfully!")
        ws.close()
    except Exception as e:
        print(f"Connection failed: {e}")

try:
    test_ws("wss://api.guig.dev/v1/asr/stream", "https://ultrablabla.guig.dev")
    test_ws("wss://api.guig.dev/v1/voice/stream", "https://ultrablabla.guig.dev")
except Exception as err:
    print(err)
