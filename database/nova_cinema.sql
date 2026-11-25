-- NOVA CINEMA: schema + demo seed. Source files: schema.sql and seed.sql.

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

-- Phiên đăng nhập. Backend lưu expires_at theo giờ UTC.
CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash BINARY(32) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,

  PRIMARY KEY (token_hash),
  KEY idx_auth_sessions_user (user_id),
  KEY idx_auth_sessions_expiry (expires_at),

  CONSTRAINT fk_auth_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
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


-- NOVA CINEMA - fictional development data, NOT actual cinema schedules.
-- Run schema.sql first. Film ids, names, posters and descriptions match the UI.
-- Ratings, release dates, prices and schedules are demonstration values.
-- Inserts only missing keys: existing records, edits, bookings and users stay intact.
-- Reimporting on another day adds missing demo showtimes for the next seven days.
SET NAMES utf8mb4;
SET time_zone = '+07:00';
USE nova_cinema;
START TRANSACTION;

INSERT INTO movies (
  id, title, short_title, genre, duration_minutes, age_rating, rating,
  review_count, format_label, country, imax, poster_url, description,
  release_date, status, is_visible, featured_order
)
SELECT demo.* FROM (
  SELECT 'dune' AS id, 'Dune: Hành Tinh Cát – Phần Hai' AS title,
    'Dune: Part Two' AS short_title, 'Hành động / Khoa học viễn tưởng' AS genre,
    166 AS duration_minutes, 'T16' AS age_rating, 9.6 AS rating,
    4200 AS review_count, 'IMAX LASER' AS format_label, 'international' AS country,
    TRUE AS imax,
    'https://bucket-image.inkmaginecms.com/version/hd/1/image/2024/07/8becb910-7d74-4098-aa73-2eea972379b6.jpg' AS poster_url,
    'Cuộc hành trình của Paul Atreides khi anh hợp nhất với Chani và những người Fremen để tìm lại công lý. Đứng trước sự giằng xé giữa tình yêu và vận mệnh, anh phải ngăn chặn một tương lai đen tối chỉ mình anh có thể nhìn thấy.' AS description,
    DATE_SUB(CURDATE(), INTERVAL 7 DAY) AS release_date,
    'now_showing' AS status, TRUE AS is_visible, 1 AS featured_order
  UNION ALL SELECT 'oppenheimer', 'Oppenheimer', 'Oppenheimer',
    'Chính kịch / Lịch sử', 180, 'T18', 9.4, 8900, 'DOLBY CINEMA', 'international', TRUE,
    '/oppenheimer.jpg',
    'Bước vào câu chuyện của nhà vật lý J. Robert Oppenheimer, nơi những khám phá khoa học đi cùng các lựa chọn làm thay đổi lịch sử.',
    DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'now_showing', TRUE, 2
  UNION ALL SELECT 'mai', 'Mai', 'Mai', 'Tâm lý / Tình cảm',
    131, 'T18', 9.1, 12000, 'GOLD LOUNGE', 'vietnam', FALSE,
    'https://phunuso.mediacdn.vn/603486343963435008/2024/2/20/photo-1-17084186348131729412485-1708419060885-17084190612161848993804.jpg',
    'Câu chuyện về một người phụ nữ với nhiều nỗi niềm quá khứ, một cuộc gặp gỡ bất ngờ và hành trình đi tìm quyền được hạnh phúc.',
    DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'now_showing', TRUE, NULL
  UNION ALL SELECT 'godzilla', 'Godzilla x Kong: Đế Chế Mới', 'Godzilla x Kong',
    'Hành động / Viễn tưởng', 115, 'T13', 8.9, 3100, '4DX 3D', 'international', FALSE,
    'https://movingstory-prod.imgix.net/mx/posters/godzilla-x-kong-the-new-empire-a9c186e4.jpg',
    'Hai Titan huyền thoại cùng đối mặt với một hiểm họa ẩn sâu trong lòng đất, đe dọa sự tồn tại của cả thế giới.',
    DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'now_showing', TRUE, 3
  UNION ALL SELECT 'deadpool', 'Deadpool & Wolverine', 'Deadpool & Wolverine',
    'Hành động / Hài hước', 128, 'T18', NULL, 0, '2D', 'international', FALSE,
    'https://m.media-amazon.com/images/M/MV5BZTk5ODY0MmQtMzA3Ni00NGY1LThiYzItZThiNjFiNDM4MTM3XkEyXkFqcGc%40._V1_.jpg',
    'Sự kết hợp bùng nổ của hai cá tính đối lập trong một chuyến phiêu lưu đầy bất ngờ.',
    DATE_ADD(CURDATE(), INTERVAL 6 DAY), 'coming_soon', TRUE, NULL
  UNION ALL SELECT 'joker', 'Joker: Folie à Deux', 'Joker: Folie à Deux',
    'Tâm lý / Nhạc kịch / Tội phạm', 138, 'T18', NULL, 0, '2D', 'international', FALSE,
    'https://images.squarespace-cdn.com/content/v1/51b3dc8ee4b051b96ceb10de/1724085929834-HJWZ76KQGWCQCCD8F3L5/Screenshot%2B2024-08-19%2Bat%2B9.41.31%E2%80%AFAM.jpg',
    'Bản tình ca đầy biến động giữa Arthur Fleck và Harley Quinn trong thế giới của âm nhạc.',
    DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'coming_soon', TRUE, NULL
  UNION ALL SELECT 'gladiator', 'Gladiator II', 'Gladiator II',
    'Sử thi / Hành động', 148, 'T18', NULL, 0, '2D', 'international', FALSE,
    'https://cf-img-a-in.tosshub.com/sites/visualstory/wp/2024/11/Snapinstaapp_461744425_449342244797266_453919909910667894_n_1080ITG-1732181655903.jpg?size=%2A%3A900',
    'Huyền thoại đấu trường La Mã trở lại với những trận chiến và khát vọng giành lại tự do.',
    DATE_ADD(CURDATE(), INTERVAL 28 DAY), 'coming_soon', TRUE, NULL
) AS demo
LEFT JOIN movies existing ON existing.id = demo.id
WHERE existing.id IS NULL;

INSERT INTO cinemas (id, name, address)
SELECT demo.* FROM (
  SELECT 1 AS id, 'NOVA Landmark 81' AS name,
    'Tầng B1, TTTM Vincom Landmark 81, TP. HCM' AS address
  UNION ALL SELECT 2, 'NOVA Westlake', 'Tầng 4, Lotte Mall West Lake, Tây Hồ, Hà Nội'
  UNION ALL SELECT 3, 'NOVA Vincom Bà Triệu', 'Tầng 6, Tháp B, 191 Bà Triệu, Hai Bà Trưng, Hà Nội'
) AS demo
LEFT JOIN cinemas existing ON existing.id = demo.id
WHERE existing.id IS NULL;

INSERT INTO rooms (id, cinema_id, name, capacity)
SELECT demo.* FROM (
  SELECT 1 AS id, 1 AS cinema_id, 'Phòng 1' AS name, 48 AS capacity
  UNION ALL SELECT 2, 1, 'Phòng 2', 48
  UNION ALL SELECT 3, 2, 'Phòng 1', 48
  UNION ALL SELECT 4, 2, 'Phòng 2', 48
  UNION ALL SELECT 5, 3, 'Phòng 1', 48
  UNION ALL SELECT 6, 3, 'Phòng 2', 48
) AS demo
LEFT JOIN rooms existing ON existing.id = demo.id
WHERE existing.id IS NULL;

-- Six rows (A-F), eight seats per row; rows D/E are VIP in this demo.
INSERT INTO seats (id, room_id, row_label, seat_number, seat_type)
SELECT room.id * 100 + row_def.row_no * 8 + seat_no.n,
  room.id, row_def.row_label, seat_no.n,
  CASE WHEN row_def.row_label IN ('D', 'E') THEN 'vip' ELSE 'standard' END
FROM rooms room
CROSS JOIN (
  SELECT 0 AS row_no, 'A' AS row_label UNION ALL SELECT 1, 'B'
  UNION ALL SELECT 2, 'C' UNION ALL SELECT 3, 'D'
  UNION ALL SELECT 4, 'E' UNION ALL SELECT 5, 'F'
) AS row_def
CROSS JOIN (
  SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
  UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
) AS seat_no
LEFT JOIN seats existing
  ON existing.id = room.id * 100 + row_def.row_no * 8 + seat_no.n
    OR (existing.room_id = room.id AND existing.row_label = row_def.row_label
        AND existing.seat_number = seat_no.n)
WHERE room.id BETWEEN 1 AND 6
  AND existing.id IS NULL;

INSERT INTO products (id, code, name, category, description, price, image_url)
SELECT demo.* FROM (
  SELECT 1 AS id, 'POPCORN-SALT' AS code, 'Bắp rang muối' AS name,
    'popcorn' AS category, 'Một phần bắp rang muối cỡ vừa.' AS description,
    45000 AS price, NULL AS image_url
  UNION ALL SELECT 2, 'POPCORN-CARAMEL', 'Bắp rang caramel', 'popcorn',
    'Một phần bắp rang caramel cỡ vừa.', 55000, NULL
  UNION ALL SELECT 3, 'POPCORN-CHEESE', 'Bắp rang phô mai', 'popcorn',
    'Một phần bắp rang phô mai cỡ vừa.', 55000, NULL
  UNION ALL SELECT 4, 'DRINK-COLA', 'Nước ngọt cola', 'drink',
    'Một ly nước ngọt cola 500 ml.', 35000, NULL
  UNION ALL SELECT 5, 'DRINK-ORANGE', 'Nước cam', 'drink',
    'Một ly nước cam 500 ml.', 35000, NULL
  UNION ALL SELECT 6, 'DRINK-WATER', 'Nước suối', 'drink',
    'Một chai nước suối 500 ml.', 20000, NULL
  UNION ALL SELECT 7, 'COMBO-SOLO', 'NOVA Solo Combo', 'combo',
    'Một bắp rang muối cỡ vừa và một ly cola 500 ml.', 70000, NULL
  UNION ALL SELECT 8, 'COMBO-COUPLE', 'NOVA Couple Combo', 'combo',
    'Một bắp rang caramel cỡ lớn và hai ly cola 500 ml.', 110000, NULL
  UNION ALL SELECT 9, 'COMBO-FAMILY', 'NOVA Family Combo', 'combo',
    'Hai bắp rang caramel cỡ lớn và bốn ly cola 500 ml.', 210000, NULL
) AS demo
LEFT JOIN products existing ON existing.id = demo.id OR existing.code = demo.code
WHERE existing.id IS NULL;

-- Each cinema has all four now-showing demo films across its two rooms.
-- Today through today + 6 days; already-started slots are skipped.
-- The demo leaves at least 30 minutes between shows. If an existing room has
-- an overlapping show, its data is preserved and the conflicting demo is skipped.
INSERT INTO showtimes (
  movie_id, room_id, starts_at, ends_at, base_price, format, status, is_demo
)
SELECT candidate.movie_id, candidate.room_id, candidate.starts_at,
  DATE_ADD(candidate.starts_at, INTERVAL movie.duration_minutes MINUTE),
  CASE WHEN candidate.movie_id = 'godzilla' THEN 110000 ELSE 90000 END,
  CASE WHEN candidate.movie_id = 'godzilla' THEN '3D' ELSE '2D' END,
  'scheduled', TRUE
FROM (
  SELECT room.id AS room_id,
    CASE
      WHEN MOD(room.id, 2) = 1 AND slot.n = 1 THEN 'mai'
      WHEN MOD(room.id, 2) = 1 THEN 'dune'
      WHEN slot.n = 1 THEN 'godzilla'
      ELSE 'oppenheimer'
    END AS movie_id,
    TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL day_offset.n DAY),
      CASE
        WHEN slot.n = 2 THEN '19:30:00'
        WHEN slot.n = 0 AND MOD(room.id, 2) = 1 THEN '10:00:00'
        WHEN slot.n = 0 THEN '10:30:00'
        WHEN MOD(room.id, 2) = 1 THEN '14:00:00'
        ELSE '14:30:00'
      END
    ) AS starts_at
  FROM rooms room
  CROSS JOIN (
    SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
    UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
  ) AS day_offset
  CROSS JOIN (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2) AS slot
  WHERE room.id BETWEEN 1 AND 6 AND room.is_active = TRUE
) AS candidate
JOIN movies movie ON movie.id = candidate.movie_id
LEFT JOIN showtimes existing
  ON existing.room_id = candidate.room_id
    AND (
      existing.starts_at = candidate.starts_at
      OR (existing.status = 'scheduled'
        AND existing.starts_at < DATE_ADD(candidate.starts_at, INTERVAL (movie.duration_minutes + 30) MINUTE)
        AND existing.ends_at > DATE_SUB(candidate.starts_at, INTERVAL 30 MINUTE))
    )
WHERE candidate.starts_at > NOW()
  AND movie.status = 'now_showing' AND movie.is_visible = TRUE
  AND movie.duration_minutes <= 180
  AND existing.id IS NULL;

-- Materialize available seats for demo shows only. Never reset held/booked rows.
-- VIP surcharge (20,000 VND) is a demo price choice, not a mandatory SRS rule.
INSERT INTO showtime_seats (showtime_id, seat_id, room_id, price)
SELECT showing.id, seat.id, showing.room_id,
  showing.base_price + CASE WHEN seat.seat_type = 'vip' THEN 20000 ELSE 0 END
FROM showtimes showing
JOIN seats seat ON seat.room_id = showing.room_id AND seat.is_active = TRUE
LEFT JOIN showtime_seats existing
  ON existing.showtime_id = showing.id AND existing.seat_id = seat.id
WHERE showing.is_demo = TRUE AND showing.status = 'scheduled'
  AND showing.starts_at > NOW()
  AND existing.showtime_id IS NULL;

-- No user, plaintext password, booking or payment is pre-created.
-- Users will be added through the team's registration/authentication feature.
COMMIT;
