.DEFAULT_GOAL := run

PYTHON ?= python3
HOST ?= 127.0.0.1
PORT ?= 4173

.PHONY: run
run:
	@echo "Mission Malice : http://$(HOST):$(PORT) — Ctrl+C pour arrêter."
	$(PYTHON) -m http.server "$(PORT)" --bind "$(HOST)"
