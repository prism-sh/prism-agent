load('ext://helm_resource', 'helm_resource', 'helm_repo')

docker_build('ghcr.io/trustless-engineering/prism-agent', 'vendor/eliza',
    dockerfile='vendor/eliza/Dockerfile'
)

# // docker_build('ghcr.io/trustless-engineering/prism-agent-client', './client',
# //     dockerfile='client/Dockerfile',
# //     live_update=[
# //         sync('./client', '/app'),
# //         run('cd /app && npm install', trigger=['package.json', 'package-lock.json']),
# //     ]
# // )

k8s_yaml(helm('./deploy/chart'))

k8s_resource(
    workload="prism-agent",
    port_forwards=["3000:3000"]
)
