CREATE DATABASE IF NOT EXISTS megafashion CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE megafashion;


CREATE TABLE IF NOT EXISTS sales (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    seller VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('dinheiro','cartao','pix') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)   ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE INDEX idx_seller_created_at ON sales (seller, created_at);