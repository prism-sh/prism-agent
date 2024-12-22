load('ext://helm_resource', 'helm_resource', 'helm_repo')
# Docker build configuration
docker_build('ghcr.io/trustless-engineering/prism-agent', '.',
    dockerfile='Dockerfile',
    live_update=[
        sync('.', '/app'),
        run('cd /app && npm install', trigger=['package.json', 'package-lock.json']),
    ]
)

docker_build('ghcr.io/trustless-engineering/prism-agent-client', './client',
    dockerfile='client/Dockerfile',
    live_update=[
        sync('./client', '/app'),
        run('cd /app && npm install', trigger=['package.json', 'package-lock.json']),
    ]
)

k8s_yaml(helm('./deploy/prism-agent'))

k8s_resource(
    workload="chart-prism-agent",
    port_forwards=["3000:3000"]
)
