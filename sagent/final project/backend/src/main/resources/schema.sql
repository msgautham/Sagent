CREATE TABLE IF NOT EXISTS roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    blocked BIT NOT NULL,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS parking_spaces (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lender_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    address VARCHAR(255) NOT NULL,
    price_per_hour DECIMAL(10, 2) NOT NULL,
    total_slots INT NOT NULL,
    available_slots INT NOT NULL,
    status VARCHAR(30) NOT NULL,
    CONSTRAINT fk_space_lender FOREIGN KEY (lender_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS parking_slots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parking_space_id BIGINT NOT NULL,
    slot_number VARCHAR(20) NOT NULL,
    slot_type VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    CONSTRAINT fk_slot_space FOREIGN KEY (parking_space_id) REFERENCES parking_spaces(id)
);

CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    buyer_id BIGINT NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type VARCHAR(30) NOT NULL,
    brand VARCHAR(40) NOT NULL,
    model VARCHAR(40) NOT NULL,
    CONSTRAINT fk_vehicle_buyer FOREIGN KEY (buyer_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    buyer_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    parking_space_id BIGINT NOT NULL,
    slot_id BIGINT NOT NULL,
    booked_start_time DATETIME NOT NULL,
    booked_end_time DATETIME NOT NULL,
    actual_entry_time DATETIME NULL,
    actual_exit_time DATETIME NULL,
    booking_status VARCHAR(30) NOT NULL,
    payment_status VARCHAR(30) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_booking_buyer FOREIGN KEY (buyer_id) REFERENCES users(id),
    CONSTRAINT fk_booking_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    CONSTRAINT fk_booking_space FOREIGN KEY (parking_space_id) REFERENCES parking_spaces(id),
    CONSTRAINT fk_booking_slot FOREIGN KEY (slot_id) REFERENCES parking_slots(id)
);

CREATE TABLE IF NOT EXISTS booking_extensions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    requested_end_time DATETIME NOT NULL,
    extra_minutes INT NOT NULL,
    extra_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL,
    CONSTRAINT fk_extension_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    payment_status VARCHAR(30) NOT NULL,
    paid_at DATETIME NOT NULL,
    CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE IF NOT EXISTS penalties (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    penalty_type VARCHAR(40) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL,
    CONSTRAINT fk_penalty_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    buyer_id BIGINT NOT NULL,
    parking_space_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment VARCHAR(500) NOT NULL,
    CONSTRAINT fk_review_buyer FOREIGN KEY (buyer_id) REFERENCES users(id),
    CONSTRAINT fk_review_space FOREIGN KEY (parking_space_id) REFERENCES parking_spaces(id)
);

CREATE TABLE IF NOT EXISTS wallets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    balance DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    wallet_id BIGINT NOT NULL,
    booking_id BIGINT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,
    CONSTRAINT fk_transaction_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id),
    CONSTRAINT fk_transaction_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(120) NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read BIT NOT NULL,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id)
);
