# Add this at the top to get the git revision
GIT_REVISION := $(shell git rev-parse --short HEAD)
NPM_VERSION = $(shell node -p "require('./package.json').version")

version-bump:
	pnpm version patch

build-and-push-server:
	docker buildx create --use --name multiarch-builder || true
	docker buildx build --platform linux/amd64,linux/arm64 \
		--network=host \
		-t ghcr.io/trustless-engineering/prism-agent:$(NPM_VERSION) \
		--push .

build-and-push-client:
	cd client && \
	docker buildx build --platform linux/amd64,linux/arm64 \
		--network=host \
		-t ghcr.io/trustless-engineering/prism-agent-client:$(NPM_VERSION) \
		--push .

build-and-push-chart:
	helm package deploy/chart --version $(NPM_VERSION) --app-version $(NPM_VERSION) -d .
	curl -u "tec-charts:tec-charts-does-not-matter" --data-binary "@prism-agent-$(NPM_VERSION).tgz" https://charts.inf.prism.sh/api/charts
	rm -f prism-agent-$(NPM_VERSION).tgz

build-and-push: build-and-push-server build-and-push-client build-and-push-chart

release-chart: version-bump build-and-push-chart

release: version-bump build-and-push
