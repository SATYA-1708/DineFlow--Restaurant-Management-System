-- ============================================================================
-- DineFlow - Restaurant Management System Database Schema (MySQL 8.0+)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `dineflow_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `dineflow_db`;

-- Drop tables in reverse order of foreign key dependencies
DROP TABLE IF EXISTS `chat_messages`;
DROP TABLE IF EXISTS `reservations`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `restaurant_tables`;
DROP TABLE IF EXISTS `menu_items`;
DROP TABLE IF EXISTS `menu_categories`;
DROP TABLE IF EXISTS `users`;

-- ----------------------------------------------------------------------------
-- 1. Table: users
-- ----------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `role` ENUM('ADMIN', 'STAFF', 'CUSTOMER') NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Table: menu_categories
-- ----------------------------------------------------------------------------
CREATE TABLE `menu_categories` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `sort_order` INT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Table: menu_items
-- ----------------------------------------------------------------------------
CREATE TABLE `menu_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `category_id` BIGINT NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `is_available` BOOLEAN DEFAULT TRUE,
  `estimated_minutes` INT DEFAULT 15,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_menu_items_category` 
    FOREIGN KEY (`category_id`) REFERENCES `menu_categories` (`id`) ON DELETE CASCADE,
  INDEX `idx_menu_items_category` (`category_id`),
  INDEX `idx_menu_items_available` (`is_available`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Table: restaurant_tables
-- ----------------------------------------------------------------------------
CREATE TABLE `restaurant_tables` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `table_number` VARCHAR(20) NOT NULL UNIQUE,
  `capacity` INT NOT NULL,
  `section` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE') DEFAULT 'AVAILABLE',
  PRIMARY KEY (`id`),
  INDEX `idx_tables_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Table: orders
-- ----------------------------------------------------------------------------
CREATE TABLE `orders` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `customer_id` BIGINT DEFAULT NULL,
  `staff_id` BIGINT DEFAULT NULL,
  `table_id` BIGINT DEFAULT NULL,
  `status` ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'SERVED', 'CLOSED', 'CANCELLED') DEFAULT 'PENDING',
  `total_amount` DECIMAL(10, 2) DEFAULT 0.00,
  `tax_amount` DECIMAL(10, 2) DEFAULT 0.00,
  `notes` TEXT DEFAULT NULL,
  `is_parcel` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_orders_staff` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_orders_table` FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables` (`id`) ON DELETE SET NULL,
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_customer` (`customer_id`),
  INDEX `idx_orders_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Table: order_items
-- ----------------------------------------------------------------------------
CREATE TABLE `order_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT NOT NULL,
  `menu_item_id` BIGINT NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(10, 2) NOT NULL,
  `special_request` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_order_items_order` 
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_menu_item` 
    FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE RESTRICT,
  INDEX `idx_order_items_order` (`order_id`),
  INDEX `idx_order_items_menu_item` (`menu_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. Table: payments
-- ----------------------------------------------------------------------------
CREATE TABLE `payments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT NOT NULL UNIQUE,
  `amount` DECIMAL(10, 2) NOT NULL,
  `payment_method` ENUM('CASH', 'CARD', 'ONLINE') NOT NULL,
  `status` ENUM('PENDING', 'COMPLETED', 'REFUNDED') DEFAULT 'PENDING',
  `transaction_ref` VARCHAR(255) DEFAULT NULL,
  `paid_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_payments_order` 
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. Table: reservations
-- ----------------------------------------------------------------------------
CREATE TABLE `reservations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `customer_id` BIGINT NOT NULL,
  `table_id` BIGINT NOT NULL,
  `party_size` INT NOT NULL,
  `reserved_at` DATETIME NOT NULL,
  `status` ENUM('PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_reservations_customer` 
    FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reservations_table` 
    FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables` (`id`) ON DELETE CASCADE,
  INDEX `idx_reservations_customer` (`customer_id`),
  INDEX `idx_reservations_time` (`reserved_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. Table: chat_messages (Live waiter/kitchen support)
-- ----------------------------------------------------------------------------
CREATE TABLE `chat_messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT NOT NULL,
  `sender_id` BIGINT NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_chat_order` 
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chat_sender` 
    FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_chat_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SAMPLE DATA SEEDING (Matches DineFlow Production State)
-- ============================================================================

-- Users (BCrypt encoded passwords for admin123, staff123, customer123)
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `role`, `is_active`) VALUES
(1, 'System Admin', 'admin@rms.com', '$2a$10$wO3mH0mUo0v0O1W2gW1mye3e7P8T7G6F7e5b6w2e3r4t5y6u7i8o9', '9876543210', 'ADMIN', 1),
(2, 'Rajesh Verma (Captain)', 'staff@rms.com', '$2a$10$wO3mH0mUo0v0O1W2gW1mye3e7P8T7G6F7e5b6w2e3r4t5y6u7i8o9', '9876543211', 'STAFF', 1),
(3, 'Rama Satya', 'customer@rms.com', '$2a$10$wO3mH0mUo0v0O1W2gW1mye3e7P8T7G6F7e5b6w2e3r4t5y6u7i8o9', '9876543212', 'CUSTOMER', 1),
(4, 'Priya Nair', 'priya@rms.com', '$2a$10$wO3mH0mUo0v0O1W2gW1mye3e7P8T7G6F7e5b6w2e3r4t5y6u7i8o9', '9876543213', 'CUSTOMER', 1);

-- Menu Categories
INSERT INTO `menu_categories` (`id`, `name`, `description`, `sort_order`, `is_active`) VALUES
(1, 'Starters & Appetizers', 'Crispy, smoky, and delightful finger foods to kickstart your meal', 1, 1),
(2, 'Tandoori Specialties', 'Clay-oven roasted kebabs and tikkas marinated with rich aromatic spices', 2, 1),
(3, 'Main Course (Curries)', 'Rich and velvety north and south Indian gravies prepared to perfection', 3, 1),
(4, 'Biryani & Rice Bowls', 'Dum-cooked basmati rice layered with fragrant saffron, herbs, and spices', 4, 1),
(5, 'Artisanal Breads', 'Freshly baked tandoori naans, rotis, and stuffed kulchas', 5, 1),
(6, 'Desserts & Beverages', 'Traditional sweet indulgences, refreshing lassis, and hot brews', 6, 1);

-- Menu Items
INSERT INTO `menu_items` (`id`, `category_id`, `name`, `description`, `price`, `image_url`, `estimated_minutes`, `is_available`) VALUES
(1, 1, 'Paneer Tikka Angara', 'Cottage cheese cubes marinated in spiced hung curd with peppers and grilled over charcoal', 280.00, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=700&auto=format&fit=crop&q=80', 15, 1),
(2, 1, 'Crispy Chilli Corn', 'Golden American corn tossed with chopped garlic, green chillies, and fresh spring onions', 220.00, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=700&auto=format&fit=crop&q=80', 12, 1),
(3, 1, 'Dahi Ke Kebab', 'Crispy golden hung curd patties spiced with green cardamom and fresh mint', 240.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&auto=format&fit=crop&q=80', 14, 1),
(4, 2, 'Murgh Malai Tikka', 'Tender chicken morsels steeped in cheese, cream, cardamom, and roasted in clay oven', 360.00, 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=700&auto=format&fit=crop&q=80', 18, 1),
(5, 2, 'Tandoori Soya Chaap', 'Protein-rich soya cutlets chargrilled with robust Punjabi spices and mint chutney', 290.00, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=700&auto=format&fit=crop&q=80', 16, 1),
(6, 3, 'Old Delhi Butter Chicken', 'Classic pulled tandoori chicken simmered in rich creamy tomato and cashew nut gravy', 420.00, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=700&auto=format&fit=crop&q=80', 20, 1),
(7, 3, 'Dal Makhani Bukhara Style', 'Slow-cooked black lentils simmered overnight with tomatoes, white butter, and cream', 290.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700&auto=format&fit=crop&q=80', 15, 1),
(8, 3, 'Paneer Butter Masala', 'Fresh cottage cheese cubes bathed in a velvety tomato-cashew makhani gravy', 320.00, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=700&auto=format&fit=crop&q=80', 16, 1),
(9, 3, 'Kashmiri Mutton Rogan Josh', 'Slow-braised spring lamb cooked with Kashmiri red chillies, ratan jot, and whole spices', 480.00, 'https://images.unsplash.com/photo-1545247181-516773cae7be?w=700&auto=format&fit=crop&q=80', 25, 1),
(10, 4, 'Hyderabadi Dum Biryani', 'Long grain basmati rice and succulent chicken slow-cooked under sealed earthen handi', 380.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80', 22, 1),
(11, 4, 'Lucknowi Subz Biryani', 'Garden fresh seasonal vegetables and fragrant basmati layered with saffron milk', 310.00, 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=700&auto=format&fit=crop&q=80', 18, 1),
(12, 5, 'Garlic Butter Naan', 'Soft leavened tandoor bread brushed with melted garlic butter and fresh coriander', 75.00, 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=700&auto=format&fit=crop&q=80', 8, 1),
(13, 5, 'Amritsari Aloo Pyaaz Kulcha', 'Crispy layered bread stuffed with spiced potatoes, onions, and pomegranate seeds', 95.00, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=700&auto=format&fit=crop&q=80', 10, 1),
(14, 6, 'Gulab Jamun with Kesari Rabri', 'Warm khoya dumplings soaked in rose saffron syrup, served on chilled rabri', 160.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=700&auto=format&fit=crop&q=80', 10, 1),
(15, 6, 'Royal Kesar Rasmalai', 'Pillowy cottage cheese patties soaked in saffron clotted milk and roasted pistachios', 180.00, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=700&auto=format&fit=crop&q=80', 8, 1),
(16, 6, 'Alphonso Mango Lassi Royale', 'Thick churned sweet yogurt blended with Ratnagiri Alphonso mango pulp and cardamom', 140.00, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=700&auto=format&fit=crop&q=80', 5, 1);

-- Restaurant Tables
INSERT INTO `restaurant_tables` (`id`, `table_number`, `capacity`, `section`, `status`) VALUES
(1, 'T-01', 2, 'Window Bay', 'OCCUPIED'),
(2, 'T-02', 2, 'Window Bay', 'AVAILABLE'),
(3, 'T-03', 4, 'Main Dining Hall', 'OCCUPIED'),
(4, 'T-04', 4, 'Main Dining Hall', 'AVAILABLE'),
(5, 'T-05', 6, 'Main Dining Hall', 'AVAILABLE'),
(6, 'T-06', 6, 'Family Lounge', 'RESERVED'),
(7, 'VIP-1', 8, 'Private Dining Suite', 'RESERVED'),
(8, 'Terrace-1', 4, 'Rooftop Patio', 'OCCUPIED'),
(9, 'Terrace-2', 4, 'Rooftop Patio', 'AVAILABLE');

-- Sample Orders
INSERT INTO `orders` (`id`, `customer_id`, `staff_id`, `table_id`, `status`, `total_amount`, `tax_amount`, `notes`, `is_parcel`, `created_at`) VALUES
(1, 3, 2, 1, 'CLOSED', 1585.50, 75.50, 'Extra crispy garlic naan requested', 0, NOW() - INTERVAL 3 HOUR),
(2, 4, 2, 3, 'CLOSED', 1512.00, 72.00, 'Medium spice level preferred', 0, NOW() - INTERVAL 2 HOUR),
(3, 3, 2, 8, 'CLOSED', 1454.25, 69.25, 'Anniversary table treat', 0, NOW() - INTERVAL 90 MINUTE),
(4, 3, 2, 1, 'SERVED', 913.50, 43.50, 'Serve piping hot', 0, NOW() - INTERVAL 45 MINUTE),
(5, 4, 2, 3, 'IN_PROGRESS', 955.50, 45.50, 'Chef special spicy tadka', 0, NOW() - INTERVAL 20 MINUTE),
(6, 3, 2, 8, 'READY', 588.00, 28.00, 'Serve with extra lemon and mint dip', 0, NOW() - INTERVAL 12 MINUTE),
(7, 3, 2, NULL, 'CONFIRMED', 1039.50, 49.50, 'Packed in eco-friendly tamper-proof containers', 1, NOW() - INTERVAL 5 MINUTE);

-- Sample Order Items
INSERT INTO `order_items` (`order_id`, `menu_item_id`, `quantity`, `unit_price`, `special_request`) VALUES
-- Order 1 items
(1, 6, 2, 420.00, 'Butter chicken boneless'),
(1, 12, 4, 75.00, 'Garlic naan crispy'),
(1, 7, 1, 290.00, 'Dal makhani extra butter'),
(1, 16, 2, 140.00, 'Mango lassi chilled'),
-- Order 2 items
(2, 10, 2, 380.00, 'With extra raita'),
(2, 4, 1, 360.00, 'Tender pieces'),
(2, 14, 2, 160.00, 'Warm gulab jamuns'),
-- Order 3 items
(3, 1, 1, 280.00, 'Spicy tikka'),
(3, 8, 1, 320.00, 'Paneer butter masala'),
(3, 12, 3, 75.00, 'Butter naan'),
(3, 15, 2, 180.00, 'Chilled rasmalai'),
-- Order 4 items
(4, 9, 1, 480.00, 'Kashmiri mutton'),
(4, 12, 2, 75.00, 'Hot naans'),
(4, 2, 1, 220.00, 'Crispy corn'),
-- Order 5 items
(5, 10, 1, 380.00, 'Biryani spicy'),
(5, 5, 1, 290.00, 'Tandoori chaap'),
(5, 3, 1, 240.00, 'Dahi kebabs'),
-- Order 6 items
(6, 1, 1, 280.00, 'Paneer tikka'),
(6, 16, 2, 140.00, 'Mango lassi');

-- Payments
INSERT INTO `payments` (`order_id`, `amount`, `payment_method`, `status`, `transaction_ref`, `paid_at`) VALUES
(1, 1585.50, 'CARD', 'COMPLETED', 'TXN-984321', NOW() - INTERVAL 3 HOUR),
(2, 1512.00, 'ONLINE', 'COMPLETED', 'TXN-541290', NOW() - INTERVAL 2 HOUR),
(3, 1454.25, 'CASH', 'COMPLETED', 'TXN-112348', NOW() - INTERVAL 90 MINUTE),
(4, 913.50, 'ONLINE', 'PENDING', 'TXN-882103', NULL),
(5, 955.50, 'CARD', 'PENDING', 'TXN-472910', NULL),
(6, 588.00, 'ONLINE', 'PENDING', 'TXN-661204', NULL),
(7, 1039.50, 'ONLINE', 'PENDING', 'TXN-773190', NULL);

-- Reservations
INSERT INTO `reservations` (`customer_id`, `table_id`, `party_size`, `reserved_at`, `status`, `notes`) VALUES
(3, 6, 4, NOW() + INTERVAL 2 HOUR, 'CONFIRMED', 'Window seating requested for anniversary dinner celebration'),
(4, 7, 6, NOW() + INTERVAL 4 HOUR, 'CONFIRMED', 'Corporate executive dining with chef tasting menu'),
(3, 2, 2, NOW() + INTERVAL 6 HOUR, 'PENDING', 'Quiet corner table for birthday dinner'),
(3, 8, 3, NOW() + INTERVAL 1 DAY, 'CONFIRMED', 'Rooftop terrace sunset reservation');
