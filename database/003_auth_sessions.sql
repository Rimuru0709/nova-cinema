-- Bổ sung phiên đăng nhập cho máy đã import schema.sql cũ.
-- Chạy trên database NOVA đang sử dụng, không xóa dữ liệu hiện có.
CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash BINARY(32) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  PRIMARY KEY (token_hash),
  KEY idx_auth_sessions_user (user_id),
  KEY idx_auth_sessions_expiry (expires_at),
  CONSTRAINT fk_auth_sessions_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
