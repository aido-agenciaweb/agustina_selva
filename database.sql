-- Base de datos para NAIS BY CAN
-- Generado para reset completo

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Eliminar tablas existentes si existen (Orden inverso para respetar FKs)
--
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `appointments`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `services`;
DROP TABLE IF EXISTS `users`;

--
-- Estructura de tabla para la tabla `users` (Admin)
--
CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff') DEFAULT 'admin',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `users`
--
INSERT INTO `users` (`name`, `email`, `password`, `created_at`, `updated_at`) VALUES
('Admin', 'admin', '$2y$12$oi7kZu3DYoD1AvOxYVpruTeNTwX3GlKXPWgjx2kY', NOW(), NOW());

--
-- Estructura de tabla para la tabla `services` (Para el select del formulario)
--
CREATE TABLE `services` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `active` boolean DEFAULT true,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `services`
--
INSERT INTO `services` (`title`, `price`, `active`, `created_at`, `updated_at`) VALUES
('Retirado de semipermanente', 10000.00, 1, NOW(), NOW()),
('Retirado de kapping gel', 10000.00, 1, NOW(), NOW()),
('Retirado de polygel', 15000.00, 1, NOW(), NOW()),
('Semi retirado de esculpido para kapping', 5000.00, 1, NOW(), NOW()),
('Manicuría + largo N°1', 30000.00, 1, NOW(), NOW()),
('Manicuría + por cada largo', 1000.00, 1, NOW(), NOW()),
('Arreglo de uña quebrada S/E', 1000.00, 1, NOW(), NOW()),
('Arreglo de uña con extension', 1000.00, 1, NOW(), NOW()),
('Limado para cambio de forma', 1000.00, 1, NOW(), NOW()),
('Manicuría tradicional sin esmaltado', 10000.00, 1, NOW(), NOW()),
('Esmaltado Semipermanente', 15000.00, 1, NOW(), NOW()),
('Base rubber', 16000.00, 1, NOW(), NOW()),
('Kapping gel', 20000.00, 1, NOW(), NOW()),
('Kapping polygel', 25000.00, 1, NOW(), NOW()),
('Service esculpidas en polygel', 25000.00, 1, NOW(), NOW());

--
-- Estructura de tabla para la tabla `products` (Listado home)
--
CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Estructura de tabla para la tabla `appointments` (Agenda/Turnos)
--
CREATE TABLE `appointments` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `client_name` varchar(255) NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `location_type` enum('local','domicilio') NOT NULL,
  `address` varchar(255) DEFAULT NULL, -- Dirección si es domicilio
  `client_request` text, -- Pedido del cliente
  `service_id` bigint(20) UNSIGNED DEFAULT NULL,
  `agreed_price` decimal(10,2) DEFAULT NULL,
  `status` enum('pendiente','confirmado','completado','cancelado') DEFAULT 'pendiente',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Estructura de tabla para la tabla `transactions` (Caja/Movimientos)
--
CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `client_name` varchar(255) DEFAULT NULL, -- Nombre del cliente (Opcional, puede venir de turno o ser manual)
  `description` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` enum('entrada','salida') NOT NULL,
  `payment_method` enum('efectivo','digital') NOT NULL,
  `appointment_id` bigint(20) UNSIGNED DEFAULT NULL, -- Si viene de un turno
  `transaction_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;