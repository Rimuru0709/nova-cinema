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
    'https://pics.filmaffinity.com/oppenheimer-389531177-large.jpg',
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
    'Khu vực Bình Thạnh, TP. Hồ Chí Minh (địa chỉ minh họa)' AS address
  UNION ALL SELECT 2, 'NOVA Westlake', 'Khu vực Tây Hồ, Hà Nội (địa chỉ minh họa)'
  UNION ALL SELECT 3, 'NOVA Vincom Bà Triệu', 'Khu vực Hai Bà Trưng, Hà Nội (địa chỉ minh họa)'
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
