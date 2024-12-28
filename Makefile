SHELL := /bin/bash

init:
	ctlptl create registry prism-registry --port 5000 || true
	ctlptl create cluster kind --registry=prism-registry || true
	git submodule update --init
	pushd deploy/chart && helm dep update && popd
	touch .env

clean:
	tilt down || true
	kubectl delete pvc --all || true
	ctlptl delete cluster kind || true
	ctlptl delete registry prism-registry || true