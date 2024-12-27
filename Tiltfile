load('ext://helm_resource', 'helm_resource', 'helm_repo')
load('ext://secret', 'secret_create_generic')
load('ext://configmap', 'configmap_create')

docker_build('ghcr.io/trustless-engineering/prism-agent', 'vendor/eliza',
    dockerfile='vendor/eliza/Dockerfile'
)

docker_build('ghcr.io/trustless-engineering/prism-agent-client', './client',
    dockerfile='client/Dockerfile',
    live_update=[
        sync('./client', '/app'),
        run('cd /app && npm install', trigger=['package.json', 'package-lock.json']),
    ]
)


secret_create_generic('prism-agent-secrets', from_env_file='.env')

configmap_create('local-prism-agent-character', from_file=['character.json=./character.json'])

k8s_yaml(helm('./deploy/chart', values='deploy/chart/values.local.yaml'))

k8s_resource(
    workload="prism-agent",
    port_forwards=["3000:3000", "3800:80"]
)