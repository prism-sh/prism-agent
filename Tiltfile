# Load required Tilt extensions
# helm_resource: Manages Helm charts
# helm_repo: Manages Helm repositories
load('ext://helm_resource', 'helm_resource', 'helm_repo')
# secret_create_generic: Creates Kubernetes secrets
load('ext://secret', 'secret_create_generic')
# configmap_create: Creates Kubernetes configmaps
load('ext://configmap', 'configmap_create')

# Disable secret scrubbing in logs for local development
secret_settings(disable_scrub=True)

docker_build('eliza-base', 'vendor/eliza',
    dockerfile='vendor/eliza/Dockerfile',
    ignore='vendor/eliza.dockerignore'
)

docker_build('ghcr.io/trustless-engineering/prism-agent', '.',
       dockerfile='Dockerfile'
)

# Build the Prism Agent client container
# Includes live update configuration for local development
docker_build('ghcr.io/trustless-engineering/prism-agent-client', './client',
    dockerfile='client/Dockerfile',
    live_update=[
        # Sync local client directory to container
        sync('./client', '/app'),
        # Run npm install when package files change
        run('cd /app && pnpm install', trigger=['package.json', 'pnpm-lock.yaml']),
    ]
)

# Create Kubernetes resources

# Create a secret from .env file
secret_create_generic('prism-agent-secrets', from_env_file='.env')

# Create a configmap from character.json file
configmap_create('local-prism-agent-character', from_file=['character.json=./character.json'])

# Deploy Helm chart with local values
k8s_yaml(helm('./deploy/charts/prism-agent', values='deploy/charts/prism-agent/values.local.yaml'))

# Configure port forwarding for the Prism Agent
# - Maps local port 3000 to container port 3000
# - Maps local port 3800 to container port 80
k8s_resource(
    workload="prism-agent",
    port_forwards=["3000:3000", "3800:80"]
)