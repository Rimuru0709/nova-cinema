-- NOVA CINEMA - shared development schema, MySQL 8.0.16+.
-- Safe to import again: this file does not drop tables or replace existing data.
-- CREATE TABLE IF NOT EXISTS does not migrate an older/different table definition.
-- All DATETIME values use Vietnam local time (UTC+07:00).
SET NAMES utf8mb4;
SET time_zone = '+07:00';

CREATE DATABASE IF NOT EXISTS nova_cinema
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nova_cinema;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(20) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  status ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
  address VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_phone (phone)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS movies (
  id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  short_title VARCHAR(150) NOT NULL,
  genre VARCHAR(255) NOT NULL,
  duration_minutes SMALLINT UNSIGNED NOT NULL,
  age_rating VARCHAR(10) NOT NULL DEFAULT 'P',
  rating DECIMAL(3,1) NULL,
  review_count INT UNSIGNED NOT NULL DEFAULT 0,
  format_label VARCHAR(80) NOT NULL DEFAULT '2D',
  country VARCHAR(50) NOT NULL DEFAULT 'international',
  imax BOOLEAN NOT NULL DEFAULT FALSE,
  poster_url TEXT NOT NULL,
  description TEXT NOT NULL,
  release_date DATE NOT NULL,
  status ENUM('now_showing', 'coming_soon', 'ended') NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  featured_order SMALLINT UNSIGNED NULL,
  trailer_url TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_movies_listing (status, is_visible),
  CONSTRAINT chk_movies_duration CHECK (duration_minutes > 0),
  CONSTRAINT chk_movies_rating CHECK (rating IS NULL OR (rating >= 0 AND rating <= 10))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cinemas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  address VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cinemas_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rooms (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cinema_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(80) NOT NULL,
  capacity SMALLINT UNSIGNED NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rooms_cinema_name (cinema_id, name),
  CONSTRAINT fk_rooms_cinema FOREIGN KEY (cinema_id) REFERENCES cinemas (id),
  CONSTRAINT chk_rooms_capacity CHECK (capacity > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS seats (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  room_id BIGINT UNSIGNED NOT NULL,
  row_label VARCHAR(4) NOT NULL,
  seat_number SMALLINT UNSIGNED NOT NULL,
  seat_type ENUM('standard', 'vip', 'couple') NOT NULL DEFAULT 'standard',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  UNIQUE KEY uq_seats_position (room_id, row_label, seat_number),
  UNIQUE KEY uq_seats_id_room (id, room_id),
  CONSTRAINT fk_seats_room FOREIGN KEY (room_id) REFERENCES rooms (id),
  CONSTRAINT chk_seats_number CHECK (seat_number > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS showtimes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  movie_id VARCHAR(64) NOT NULL,
  room_id BIGINT UNSIGNED NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  base_price DECIMAL(12,0) NOT NULL,
  format ENUM('2D', '3D', 'IMAX') NOT NULL DEFAULT '2D',
  status ENUM('scheduled', 'cancelled') NOT NULL DEFAULT 'scheduled',
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id),
  UNIQUE KEY uq_showtimes_room_start (room_id, starts_at),
  UNIQUE KEY uq_showtimes_id_room (id, room_id),
  KEY idx_showtimes_movie_date (movie_id, starts_at),
  CONSTRAINT fk_showtimes_movie FOREIGN KEY (movie_id) REFERENCES movies (id),
  CONSTRAINT fk_showtimes_room FOREIGN KEY (room_id) REFERENCES rooms (id),
  CONSTRAINT chk_showtimes_interval CHECK (ends_at > starts_at),
  CONSTRAINT chk_showtimes_price CHECK (base_price >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(150) NOT NULL,
  category ENUM('popcorn', 'drink', 'combo') NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(12,0) NOT NULL,
  image_url TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_code (code),
  CONSTRAINT chk_products_price CHECK (price >= 0)
) ENGINE=InnoDB;

-- A hold belongs to one user and one showtime. The booking service should create
-- expires_at = creation time + 3 minutes; importing this schema starts no timer.
CREATE TABLE IF NOT EXISTS seat_holds (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  showtime_id BIGINT UNSIGNED NOT NULL,
  status ENUM('active', 'converted', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_holds_owner (id, showtime_id, user_id),
  UNIQUE KEY uq_holds_expiry (id, showtime_id, expires_at),
  KEY idx_holds_expiry (status, expires_at),
  CONSTRAINT fk_holds_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_holds_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes (id),
  CONSTRAINT chk_holds_expiry CHECK (expires_at > created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_code VARCHAR(32) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  showtime_id BIGINT UNSIGNED NOT NULL,
  hold_id BIGINT UNSIGNED NULL,
  status ENUM('pending', 'paid', 'payment_failed', 'cancelled', 'expired') NOT NULL DEFAULT 'pending',
  ticket_subtotal DECIMAL(12,0) NOT NULL DEFAULT 0,
  product_subtotal DECIMAL(12,0) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,0) NOT NULL DEFAULT 0,
  qr_token VARCHAR(128) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bookings_code (booking_code),
  UNIQUE KEY uq_bookings_qr (qr_token),
  UNIQUE KEY uq_bookings_hold (hold_id),
  UNIQUE KEY uq_bookings_showtime (id, showtime_id),
  KEY idx_bookings_user_created (user_id, created_at),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_bookings_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes (id),
  CONSTRAINT fk_bookings_hold_owner FOREIGN KEY (hold_id, showtime_id, user_id)
    REFERENCES seat_holds (id, showtime_id, user_id),
  CONSTRAINT chk_bookings_amounts CHECK (
    ticket_subtotal >= 0 AND product_subtotal >= 0
    AND total_amount = ticket_subtotal + product_subtotal
  ),
  CONSTRAINT chk_bookings_paid CHECK (
    (status = 'paid' AND paid_at IS NOT NULL AND qr_token IS NOT NULL)
    OR (status <> 'paid' AND paid_at IS NULL AND qr_token IS NULL)
  )
) ENGINE=InnoDB;

-- One inventory row per seat/showtime; it can have at most one current owner.
-- TV3/TV4 must still use transactions and row locks for holds, expiry, payment
-- and conversion to booked. SQL import alone does not implement that workflow.
CREATE TABLE IF NOT EXISTS showtime_seats (
  showtime_id BIGINT UNSIGNED NOT NULL,
  seat_id BIGINT UNSIGNED NOT NULL,
  room_id BIGINT UNSIGNED NOT NULL,
  price DECIMAL(12,0) NOT NULL,
  state ENUM('available', 'held', 'booked') NOT NULL DEFAULT 'available',
  hold_id BIGINT UNSIGNED NULL,
  held_until DATETIME NULL,
  booking_id BIGINT UNSIGNED NULL,
  PRIMARY KEY (showtime_id, seat_id),
  KEY idx_inventory_hold (hold_id, showtime_id, held_until),
  KEY idx_inventory_booking (booking_id, showtime_id),
  CONSTRAINT fk_inventory_showtime_room FOREIGN KEY (showtime_id, room_id)
    REFERENCES showtimes (id, room_id),
  CONSTRAINT fk_inventory_seat_room FOREIGN KEY (seat_id, room_id)
    REFERENCES seats (id, room_id),
  CONSTRAINT fk_inventory_hold_expiry FOREIGN KEY (hold_id, showtime_id, held_until)
    REFERENCES seat_holds (id, showtime_id, expires_at),
  CONSTRAINT fk_inventory_booking FOREIGN KEY (booking_id, showtime_id)
    REFERENCES bookings (id, showtime_id),
  CONSTRAINT chk_inventory_price CHECK (price >= 0),
  CONSTRAINT chk_inventory_owner CHECK (
    (state = 'available' AND hold_id IS NULL AND held_until IS NULL AND booking_id IS NULL)
    OR (state = 'held' AND hold_id IS NOT NULL AND held_until IS NOT NULL AND booking_id IS NULL)
    OR (state = 'booked' AND hold_id IS NULL AND held_until IS NULL AND booking_id IS NOT NULL)
  )
) ENGINE=InnoDB;

-- Historical booking lines may refer to a seat previously released by a failed
-- or expired booking. Current ownership is kept only in showtime_seats above.
CREATE TABLE IF NOT EXISTS booking_seats (
  booking_id BIGINT UNSIGNED NOT NULL,
  showtime_id BIGINT UNSIGNED NOT NULL,
  seat_id BIGINT UNSIGNED NOT NULL,
  seat_label VARCHAR(12) NOT NULL,
  unit_price DECIMAL(12,0) NOT NULL,
  PRIMARY KEY (booking_id, seat_id),
  CONSTRAINT fk_booking_seats_booking FOREIGN KEY (booking_id, showtime_id)
    REFERENCES bookings (id, showtime_id),
  CONSTRAINT fk_booking_seats_inventory FOREIGN KEY (showtime_id, seat_id)
    REFERENCES showtime_seats (showtime_id, seat_id),
  CONSTRAINT chk_booking_seats_price CHECK (unit_price >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS booking_items (
  booking_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  quantity SMALLINT UNSIGNED NOT NULL,
  unit_price DECIMAL(12,0) NOT NULL,
  PRIMARY KEY (booking_id, product_id),
  CONSTRAINT fk_booking_items_booking FOREIGN KEY (booking_id) REFERENCES bookings (id),
  CONSTRAINT fk_booking_items_product FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT chk_booking_items_quantity CHECK (quantity > 0),
  CONSTRAINT chk_booking_items_price CHECK (unit_price >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  transaction_code VARCHAR(100) NOT NULL,
  method VARCHAR(40) NOT NULL DEFAULT 'mock',
  is_mock BOOLEAN NOT NULL DEFAULT TRUE,
  amount DECIMAL(12,0) NOT NULL,
  status ENUM('pending', 'succeeded', 'failed') NOT NULL DEFAULT 'pending',
  failure_reason VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  succeeded_booking_id BIGINT UNSIGNED GENERATED ALWAYS AS
    (CASE WHEN status = 'succeeded' THEN booking_id ELSE NULL END) STORED,
  PRIMARY KEY (id),
  UNIQUE KEY uq_payments_transaction (transaction_code),
  UNIQUE KEY uq_payments_successful_booking (succeeded_booking_id),
  KEY idx_payments_booking (booking_id, created_at),
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings (id),
  CONSTRAINT chk_payments_amount CHECK (amount >= 0),
  CONSTRAINT chk_payments_completed CHECK (
    (status = 'pending' AND completed_at IS NULL)
    OR (status <> 'pending' AND completed_at IS NOT NULL)
  )
) ENGINE=InnoDB;
