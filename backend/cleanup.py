import os
import time
import threading

from config import TEMP_DIR, CLEANUP_INTERVAL


def cleanup_temp_files():
    now = time.time()
    for fname in os.listdir(TEMP_DIR):
        if fname == "chat_history.json":
            continue
        fpath = os.path.join(TEMP_DIR, fname)
        if os.path.isfile(fpath):
            age = now - os.path.getmtime(fpath)
            if age > CLEANUP_INTERVAL:
                try:
                    os.remove(fpath)
                except OSError:
                    pass


def start_cleanup_loop():
    def loop():
        while True:
            time.sleep(CLEANUP_INTERVAL)
            cleanup_temp_files()
    t = threading.Thread(target=loop, daemon=True)
    t.start()
