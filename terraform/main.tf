# Bridge

resource "docker_network" "app_network" {
    name = "app_network"
    driver = "bridge"
}

# MySQL
resource "docker_image" "mysql" {
    name = "mysql:5.7"
}

resource "docker_container" "mysql" {
    name = "mysql"
    image = docker_image.mysql.image_id

    ports {
        internal = 3306
        external = 3306
    }

    volumes {
        host_path = abspath("${path.root}/../mysql_migrations")
        container_path = "/docker-entrypoint-initdb.d"  
    }

    env = [
        "MYSQL_ROOT_PASSWORD=rootpassword",
        "MYSQL_DATABASE=k8s_lb_logs"
    ]

    networks_advanced {
        name = docker_network.app_network.name
    }

    healthcheck {
        test = ["CMD", "mysqladmin", "ping", "-h", "localhost"]
        interval = "10s"
        timeout = "5s"
        retries = 5
    }
}

# Backend
resource "docker_image" "backend" {
    name = "k8s-lb-logs-backend:latest"
    build {
        context = "${path.root}/../backend"
        tag = ["k8s-lb-logs-backend:latest"]
    }
}

resource "docker_container" "backend" {
    name  = "backend"
    image = docker_image.backend.image_id

    ports {
        internal = 5000
        external = 5000
    }

    env = [
        "DB_HOST=mysql",
        "DB_USER=root",
        "DB_PASSWORD=rootpassword",
        "DB_NAME=k8s_lb_logs"
    ]

    networks_advanced {
        name = docker_network.app_network.name
    }

    depends_on = [docker_container.mysql]

    provisioner "local-exec" {
        command = "powershell -Command \"for ($i=0; $i -lt 30; $i++) { try { mysqladmin ping -h mysql --silent; if ($?) { exit 0 } } catch { Write-Host 'Waiting for MySQL'; Start-Sleep 1 } }\""
    }
}

# Frontend
resource "docker_image" "frontend" {
    name = "k8s-lb-logs-frontend:latest"
    build {
        context = "${path.root}/../frontend" 
        tag = ["k8s-lb-logs-frontend:latest"]
    }
}

resource "docker_container" "frontend" {
    name = "frontend"
    image = docker_image.frontend.image_id

    ports {
        internal = 80
        external = 8080
    }

    env = [ 
        "BACKEND_URL=http://localhost:5000"
    ]

    networks_advanced {
        name = docker_network.app_network.name
    }

    depends_on = [docker_container.backend]
}

