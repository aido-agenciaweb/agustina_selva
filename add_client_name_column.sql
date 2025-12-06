-- Migración manual para agregar columna client_name a transactions
-- Ejecuta este SQL en phpMyAdmin

-- Agregar columna client_name a la tabla transactions
ALTER TABLE `transactions` 
ADD COLUMN `client_name` VARCHAR(255) NOT NULL AFTER `id`;

-- Verificar que se agregó correctamente
DESCRIBE `transactions`;
