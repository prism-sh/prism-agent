#! /bin/bash

# Create the local Docker Registry
ctlptl create registry prism-registry --port 5000

# Create the local Kubernetes-in-Docker (KIND) Cluster
ctlptl create cluster kind --registry=prism-registry

# Initialize the Eliza repo
git submodule update --init

## Refresh helm dependencies
pushd deploy/chart 
    helm dep update
popd

touch .env