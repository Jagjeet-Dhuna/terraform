output "app_network_name" {
    description = "Name of the network created for the app"
    value = docker_network.app_network.name
}

output "frontend_url" {
    description = "URL to access the frontend app"
    value = "http://localhost:${docker_container.frontend.ports[0].external}"
}

output "backend_url" {
    description = "URL to access the backend API"
    value = "http://localhost:${docker_container.backend.ports[0].external}"
}

output "container_info" {
    description = "Information about all containers"
    value = {
        mysql = {
            id = docker_container.mysql.id
            name = docker_container.mysql.name
            running = docker_container.mysql.must_run
        }
        backend = {
            id = docker_container.backend.id
            name = docker_container.backend.name
            running = docker_container.backend.must_run
        }
        frontend = {
            id = docker_container.frontend.id
            name = docker_container.frontend.name
            running = docker_container.frontend.must_run
        }
    }
}