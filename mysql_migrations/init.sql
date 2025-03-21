-- init.sql
CREATE DATABASE IF NOT EXISTS k8s_lb_logs;
USE k8s_lb_logs;

CREATE TABLE logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pod_name VARCHAR(255) NOT NULL,
  local_time TIMESTAMP NOT NULL,
  version VARCHAR(50) NOT NULL,
  environment VARCHAR(50) NOT NULL
);

