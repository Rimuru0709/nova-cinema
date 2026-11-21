USE nova_cinema;

CREATE TABLE IF NOT EXISTS oauth_identities (
    provider ENUM('google', 'apple') NOT NULL,
    subject VARBINARY(255) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (provider, subject),
    UNIQUE KEY uq_oauth_user_provider (user_id, provider),
    CONSTRAINT fk_oauth_identity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
