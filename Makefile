SHELL := /bin/bash

init:
	ctlptl create registry prism-registry --port 5000 || true
	ctlptl create cluster kind --registry=prism-registry || true
	git submodule update --init
	pushd deploy/charts/prism-agent && helm dep update && popd
	touch .env

build-eliza:
	pushd vendor/eliza
	pnpm install
	pnpm run build
	popd


clean-eliza:
	pushd vendor/eliza
	git reset --hard
	git clean -fdx
	popd

clean:
	tilt down || true
	kubectl delete pvc --all || true
	ctlptl delete cluster kind || true
	ctlptl delete registry prism-registry || true