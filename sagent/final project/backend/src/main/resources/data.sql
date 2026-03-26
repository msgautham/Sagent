INSERT IGNORE INTO roles (id, name) VALUES
(1, 'ADMIN'),
(2, 'PARKING_SPACE_LENDER'),
(3, 'PARKING_SPACE_BUYER');

INSERT IGNORE INTO users (id, name, email, phone, password_hash, role_id, created_at, blocked) VALUES
(1, 'Aarav Admin', 'admin@parking.com', '9000000001', 'password', 1, '2026-01-01 09:00:00', 0),
(2, 'Lakshmi Lender', 'lakshmi.lender@parking.com', '9000000002', 'password', 2, '2026-01-02 09:00:00', 0),
(3, 'Rohan Lender', 'rohan.lender@parking.com', '9000000003', 'password', 2, '2026-01-03 09:00:00', 0),
(4, 'Priya Lender', 'priya.lender@parking.com', '9000000004', 'password', 2, '2026-01-04 09:00:00', 0),
(5, 'Arjun Lender', 'arjun.lender@parking.com', '9000000005', 'password', 2, '2026-01-05 09:00:00', 0),
(6, 'Nisha Lender', 'nisha.lender@parking.com', '9000000006', 'password', 2, '2026-01-06 09:00:00', 0),
(7, 'Meera Buyer', 'meera.buyer@parking.com', '9000000007', 'password', 3, '2026-01-07 09:00:00', 0),
(8, 'Vikram Buyer', 'vikram.buyer@parking.com', '9000000008', 'password', 3, '2026-01-08 09:00:00', 0),
(9, 'Sana Buyer', 'sana.buyer@parking.com', '9000000009', 'password', 3, '2026-01-09 09:00:00', 0),
(10, 'Dev Buyer', 'dev.buyer@parking.com', '9000000010', 'password', 3, '2026-01-10 09:00:00', 0);

INSERT IGNORE INTO wallets (id, user_id, balance) VALUES
(1, 1, 20000.00),
(2, 2, 15000.00),
(3, 3, 15000.00),
(4, 4, 15000.00),
(5, 5, 15000.00),
(6, 6, 15000.00),
(7, 7, 12000.00),
(8, 8, 11000.00),
(9, 9, 10000.00),
(10, 10, 9000.00);

INSERT IGNORE INTO parking_spaces (id, lender_id, name, description, latitude, longitude, address, price_per_hour, total_slots, available_slots, status) VALUES
(1, 2, 'Marina Bay Parking', 'Secure covered parking near Marina Beach.', 13.082700, 80.270700, 'Marina Beach Road, Chennai', 60.00, 5, 3, 'APPROVED'),
(2, 2, 'T Nagar Smart Park', 'High-demand shopping district parking.', 13.041800, 80.233700, 'T Nagar, Chennai', 75.00, 5, 4, 'APPROVED'),
(3, 2, 'OMR Tech Hub Parking', 'Office commuter parking on OMR.', 12.912100, 80.229500, 'Sholinganallur, Chennai', 55.00, 5, 2, 'APPROVED'),
(4, 2, 'Adyar Riverfront Parking', 'Residential and visitor parking.', 13.006700, 80.257300, 'Adyar, Chennai', 50.00, 5, 5, 'PENDING_APPROVAL'),
(5, 3, 'MG Road Metro Parking', 'Prime central Bengaluru parking.', 12.975600, 77.605000, 'MG Road, Bengaluru', 80.00, 5, 3, 'APPROVED'),
(6, 3, 'Koramangala Plaza Parking', 'Food street and office parking.', 12.935200, 77.624500, 'Koramangala, Bengaluru', 70.00, 5, 4, 'APPROVED'),
(7, 3, 'Whitefield Park Point', 'Tech corridor open-air parking.', 12.969800, 77.749900, 'Whitefield, Bengaluru', 65.00, 5, 3, 'APPROVED'),
(8, 3, 'Indiranagar Loft Parking', 'Boutique retail zone parking.', 12.971900, 77.641200, 'Indiranagar, Bengaluru', 78.00, 5, 5, 'APPROVED'),
(9, 4, 'Banjara Hills Elite Parking', 'Premium valet-assisted parking.', 17.412600, 78.448200, 'Banjara Hills, Hyderabad', 85.00, 5, 2, 'APPROVED'),
(10, 4, 'Hitech City Loop Parking', 'Ideal for office commuters.', 17.443500, 78.377200, 'Hitech City, Hyderabad', 68.00, 5, 4, 'APPROVED'),
(11, 4, 'Secunderabad Station Parking', 'Transit parking near station.', 17.439900, 78.498300, 'Secunderabad, Hyderabad', 58.00, 5, 3, 'APPROVED'),
(12, 4, 'Gachibowli Arena Parking', 'IT district parking with CCTV.', 17.440100, 78.348900, 'Gachibowli, Hyderabad', 72.00, 5, 5, 'PENDING_APPROVAL'),
(13, 5, 'Nariman Point Garage', 'Business district basement parking.', 18.925600, 72.824200, 'Nariman Point, Mumbai', 110.00, 5, 2, 'APPROVED'),
(14, 5, 'Bandra Seaface Parking', 'Beachfront premium parking.', 19.059600, 72.829500, 'Bandra West, Mumbai', 95.00, 5, 3, 'APPROVED'),
(15, 5, 'Andheri Hub Parking', 'Airport corridor hourly parking.', 19.113600, 72.869700, 'Andheri East, Mumbai', 90.00, 5, 4, 'APPROVED'),
(16, 5, 'Powai Lakeview Parking', 'Mixed-use township parking.', 19.117600, 72.906000, 'Powai, Mumbai', 88.00, 5, 4, 'APPROVED'),
(17, 6, 'Velachery Flyover Parking', 'Mall and station parking.', 12.975100, 80.221200, 'Velachery, Chennai', 52.00, 5, 5, 'APPROVED'),
(18, 6, 'Electronic City Tower Parking', 'Startup and campus parking.', 12.845600, 77.660300, 'Electronic City, Bengaluru', 62.00, 5, 3, 'APPROVED'),
(19, 6, 'Jubilee Hills Deck Parking', 'Event-friendly rooftop parking.', 17.432500, 78.407300, 'Jubilee Hills, Hyderabad', 76.00, 5, 5, 'APPROVED'),
(20, 6, 'Lower Parel Smart Park', 'Commercial tower smart access parking.', 18.998800, 72.825800, 'Lower Parel, Mumbai', 105.00, 5, 2, 'APPROVED');

INSERT IGNORE INTO parking_slots (id, parking_space_id, slot_number, slot_type, status) VALUES
(1,1,'C1-S1','CAR','RESERVED'),(2,1,'C1-S2','CAR','RESERVED'),(3,1,'C1-S3','CAR','AVAILABLE'),(4,1,'C1-S4','SUV','AVAILABLE'),(5,1,'C1-S5','EV','AVAILABLE'),
(6,2,'C2-S1','CAR','RESERVED'),(7,2,'C2-S2','CAR','AVAILABLE'),(8,2,'C2-S3','SUV','AVAILABLE'),(9,2,'C2-S4','EV','AVAILABLE'),(10,2,'C2-S5','CAR','AVAILABLE'),
(11,3,'C3-S1','CAR','RESERVED'),(12,3,'C3-S2','CAR','RESERVED'),(13,3,'C3-S3','SUV','AVAILABLE'),(14,3,'C3-S4','EV','AVAILABLE'),(15,3,'C3-S5','CAR','AVAILABLE'),
(16,4,'C4-S1','CAR','AVAILABLE'),(17,4,'C4-S2','CAR','AVAILABLE'),(18,4,'C4-S3','SUV','AVAILABLE'),(19,4,'C4-S4','EV','AVAILABLE'),(20,4,'C4-S5','CAR','AVAILABLE'),
(21,5,'B1-S1','CAR','RESERVED'),(22,5,'B1-S2','CAR','RESERVED'),(23,5,'B1-S3','SUV','AVAILABLE'),(24,5,'B1-S4','EV','AVAILABLE'),(25,5,'B1-S5','CAR','AVAILABLE'),
(26,6,'B2-S1','CAR','RESERVED'),(27,6,'B2-S2','CAR','AVAILABLE'),(28,6,'B2-S3','SUV','AVAILABLE'),(29,6,'B2-S4','EV','AVAILABLE'),(30,6,'B2-S5','CAR','AVAILABLE'),
(31,7,'B3-S1','CAR','RESERVED'),(32,7,'B3-S2','CAR','RESERVED'),(33,7,'B3-S3','SUV','AVAILABLE'),(34,7,'B3-S4','EV','AVAILABLE'),(35,7,'B3-S5','CAR','AVAILABLE'),
(36,8,'B4-S1','CAR','AVAILABLE'),(37,8,'B4-S2','CAR','AVAILABLE'),(38,8,'B4-S3','SUV','AVAILABLE'),(39,8,'B4-S4','EV','AVAILABLE'),(40,8,'B4-S5','CAR','AVAILABLE'),
(41,9,'H1-S1','CAR','RESERVED'),(42,9,'H1-S2','CAR','RESERVED'),(43,9,'H1-S3','SUV','AVAILABLE'),(44,9,'H1-S4','EV','AVAILABLE'),(45,9,'H1-S5','CAR','AVAILABLE'),
(46,10,'H2-S1','CAR','RESERVED'),(47,10,'H2-S2','CAR','AVAILABLE'),(48,10,'H2-S3','SUV','AVAILABLE'),(49,10,'H2-S4','EV','AVAILABLE'),(50,10,'H2-S5','CAR','AVAILABLE'),
(51,11,'H3-S1','CAR','RESERVED'),(52,11,'H3-S2','CAR','RESERVED'),(53,11,'H3-S3','SUV','AVAILABLE'),(54,11,'H3-S4','EV','AVAILABLE'),(55,11,'H3-S5','CAR','AVAILABLE'),
(56,12,'H4-S1','CAR','AVAILABLE'),(57,12,'H4-S2','CAR','AVAILABLE'),(58,12,'H4-S3','SUV','AVAILABLE'),(59,12,'H4-S4','EV','AVAILABLE'),(60,12,'H4-S5','CAR','AVAILABLE'),
(61,13,'M1-S1','CAR','RESERVED'),(62,13,'M1-S2','CAR','RESERVED'),(63,13,'M1-S3','SUV','AVAILABLE'),(64,13,'M1-S4','EV','AVAILABLE'),(65,13,'M1-S5','CAR','AVAILABLE'),
(66,14,'M2-S1','CAR','RESERVED'),(67,14,'M2-S2','CAR','RESERVED'),(68,14,'M2-S3','SUV','AVAILABLE'),(69,14,'M2-S4','EV','AVAILABLE'),(70,14,'M2-S5','CAR','AVAILABLE'),
(71,15,'M3-S1','CAR','RESERVED'),(72,15,'M3-S2','CAR','AVAILABLE'),(73,15,'M3-S3','SUV','AVAILABLE'),(74,15,'M3-S4','EV','AVAILABLE'),(75,15,'M3-S5','CAR','AVAILABLE'),
(76,16,'M4-S1','CAR','RESERVED'),(77,16,'M4-S2','CAR','AVAILABLE'),(78,16,'M4-S3','SUV','AVAILABLE'),(79,16,'M4-S4','EV','AVAILABLE'),(80,16,'M4-S5','CAR','AVAILABLE'),
(81,17,'C5-S1','CAR','AVAILABLE'),(82,17,'C5-S2','CAR','AVAILABLE'),(83,17,'C5-S3','SUV','AVAILABLE'),(84,17,'C5-S4','EV','AVAILABLE'),(85,17,'C5-S5','CAR','AVAILABLE'),
(86,18,'B5-S1','CAR','RESERVED'),(87,18,'B5-S2','CAR','RESERVED'),(88,18,'B5-S3','SUV','AVAILABLE'),(89,18,'B5-S4','EV','AVAILABLE'),(90,18,'B5-S5','CAR','AVAILABLE'),
(91,19,'H5-S1','CAR','AVAILABLE'),(92,19,'H5-S2','CAR','AVAILABLE'),(93,19,'H5-S3','SUV','AVAILABLE'),(94,19,'H5-S4','EV','AVAILABLE'),(95,19,'H5-S5','CAR','AVAILABLE'),
(96,20,'M5-S1','CAR','RESERVED'),(97,20,'M5-S2','CAR','RESERVED'),(98,20,'M5-S3','SUV','AVAILABLE'),(99,20,'M5-S4','EV','AVAILABLE'),(100,20,'M5-S5','CAR','AVAILABLE');

INSERT IGNORE INTO vehicles (id, buyer_id, vehicle_number, vehicle_type, brand, model) VALUES
(1,7,'TN01AA1001','CAR','Hyundai','i20'),
(2,7,'TN01AA1002','BIKE','Honda','Activa'),
(3,7,'TN01AA1003','SUV','Kia','Seltos'),
(4,7,'TN01AA1004','CAR','Maruti','Baleno'),
(5,7,'TN01AA1005','EV','Tata','Nexon EV'),
(6,8,'KA01BB2001','CAR','Toyota','Glanza'),
(7,8,'KA01BB2002','BIKE','Yamaha','FZ'),
(8,8,'KA01BB2003','SUV','Mahindra','XUV700'),
(9,8,'KA01BB2004','CAR','Honda','City'),
(10,8,'KA01BB2005','EV','MG','ZS EV'),
(11,9,'TS01CC3001','CAR','Skoda','Slavia'),
(12,9,'TS01CC3002','BIKE','TVS','Jupiter'),
(13,9,'TS01CC3003','SUV','Hyundai','Creta'),
(14,9,'TS01CC3004','CAR','Volkswagen','Virtus'),
(15,9,'TS01CC3005','EV','BYD','Atto 3'),
(16,10,'MH01DD4001','CAR','Renault','Kiger'),
(17,10,'MH01DD4002','BIKE','Bajaj','Pulsar'),
(18,10,'MH01DD4003','SUV','Jeep','Compass'),
(19,10,'MH01DD4004','CAR','Tata','Altroz'),
(20,10,'MH01DD4005','EV','Mahindra','XUV400');

INSERT IGNORE INTO bookings (id, buyer_id, vehicle_id, parking_space_id, slot_id, booked_start_time, booked_end_time, actual_entry_time, actual_exit_time, booking_status, payment_status, total_amount) VALUES
(1,7,1,1,1,'2026-03-01 08:00:00','2026-03-01 11:00:00','2026-03-01 08:05:00','2026-03-01 11:10:00','OVERSTAY','SUCCESS',180.00),
(2,7,2,2,6,'2026-03-01 12:00:00','2026-03-01 14:00:00','2026-03-01 12:00:00','2026-03-01 13:55:00','COMPLETED','SUCCESS',150.00),
(3,7,3,3,11,'2026-03-02 09:00:00','2026-03-02 12:00:00','2026-03-02 09:03:00','2026-03-02 12:00:00','COMPLETED','SUCCESS',165.00),
(4,7,4,5,21,'2026-03-02 15:00:00','2026-03-02 17:30:00','2026-03-02 15:00:00','2026-03-02 17:15:00','COMPLETED','SUCCESS',240.00),
(5,7,5,6,26,'2026-03-03 10:00:00','2026-03-03 12:00:00','2026-03-03 10:00:00','2026-03-03 12:00:00','COMPLETED','SUCCESS',140.00),
(6,8,6,7,31,'2026-03-03 08:30:00','2026-03-03 11:30:00','2026-03-03 08:31:00','2026-03-03 11:20:00','COMPLETED','SUCCESS',195.00),
(7,8,7,9,41,'2026-03-03 14:00:00','2026-03-03 16:00:00','2026-03-03 14:02:00','2026-03-03 16:10:00','OVERSTAY','SUCCESS',170.00),
(8,8,8,10,46,'2026-03-04 07:00:00','2026-03-04 10:00:00','2026-03-04 07:00:00','2026-03-04 09:45:00','COMPLETED','SUCCESS',204.00),
(9,8,9,11,51,'2026-03-04 11:00:00','2026-03-04 13:00:00','2026-03-04 11:05:00','2026-03-04 13:00:00','COMPLETED','SUCCESS',116.00),
(10,8,10,13,61,'2026-03-04 18:00:00','2026-03-04 21:00:00','2026-03-04 18:00:00','2026-03-04 21:15:00','OVERSTAY','SUCCESS',330.00),
(11,9,11,14,66,'2026-03-05 09:00:00','2026-03-05 12:00:00','2026-03-05 09:00:00','2026-03-05 11:55:00','COMPLETED','SUCCESS',285.00),
(12,9,12,15,71,'2026-03-05 13:00:00','2026-03-05 15:30:00','2026-03-05 13:00:00','2026-03-05 15:20:00','COMPLETED','SUCCESS',225.00),
(13,9,13,16,76,'2026-03-05 17:00:00','2026-03-05 20:00:00','2026-03-05 17:02:00','2026-03-05 20:10:00','OVERSTAY','SUCCESS',264.00),
(14,9,14,17,81,'2026-03-06 08:00:00','2026-03-06 10:00:00','2026-03-06 08:00:00','2026-03-06 09:50:00','COMPLETED','SUCCESS',104.00),
(15,9,15,18,86,'2026-03-06 12:00:00','2026-03-06 15:00:00','2026-03-06 12:01:00','2026-03-06 15:00:00','COMPLETED','SUCCESS',186.00),
(16,10,16,19,91,'2026-03-06 16:00:00','2026-03-06 18:00:00','2026-03-06 16:00:00','2026-03-06 18:00:00','COMPLETED','SUCCESS',152.00),
(17,10,17,20,96,'2026-03-07 07:30:00','2026-03-07 10:30:00','2026-03-07 07:30:00','2026-03-07 10:40:00','OVERSTAY','SUCCESS',315.00),
(18,10,18,1,2,'2026-03-07 12:00:00','2026-03-07 14:00:00','2026-03-07 12:00:00','2026-03-07 13:59:00','COMPLETED','SUCCESS',120.00),
(19,10,19,5,22,'2026-03-07 15:00:00','2026-03-07 17:00:00','2026-03-07 15:00:00','2026-03-07 17:00:00','COMPLETED','SUCCESS',160.00),
(20,10,20,20,97,'2026-03-08 09:00:00','2026-03-08 12:00:00','2026-03-08 09:00:00',NULL,'CONFIRMED','PENDING',315.00);

INSERT IGNORE INTO booking_extensions (id, booking_id, requested_end_time, extra_minutes, extra_amount, status) VALUES
(1, 20, '2026-03-08 13:00:00', 60, 105.00, 'APPROVED');

INSERT IGNORE INTO payments (id, booking_id, amount, payment_method, payment_status, paid_at) VALUES
(1,1,180.00,'WALLET','SUCCESS','2026-03-01 07:55:00'),
(2,2,150.00,'UPI','SUCCESS','2026-03-01 11:55:00'),
(3,3,165.00,'WALLET','SUCCESS','2026-03-02 08:55:00'),
(4,4,240.00,'CARD','SUCCESS','2026-03-02 14:55:00'),
(5,5,140.00,'WALLET','SUCCESS','2026-03-03 09:55:00'),
(6,6,195.00,'CARD','SUCCESS','2026-03-03 08:15:00'),
(7,7,170.00,'UPI','SUCCESS','2026-03-03 13:45:00'),
(8,8,204.00,'WALLET','SUCCESS','2026-03-04 06:45:00'),
(9,9,116.00,'WALLET','SUCCESS','2026-03-04 10:45:00'),
(10,10,330.00,'CARD','SUCCESS','2026-03-04 17:45:00'),
(11,11,285.00,'UPI','SUCCESS','2026-03-05 08:45:00'),
(12,12,225.00,'WALLET','SUCCESS','2026-03-05 12:45:00'),
(13,13,264.00,'UPI','SUCCESS','2026-03-05 16:45:00'),
(14,14,104.00,'CARD','SUCCESS','2026-03-06 07:45:00'),
(15,15,186.00,'WALLET','SUCCESS','2026-03-06 11:45:00'),
(16,16,152.00,'UPI','SUCCESS','2026-03-06 15:45:00'),
(17,17,315.00,'CARD','SUCCESS','2026-03-07 07:15:00'),
(18,18,120.00,'WALLET','SUCCESS','2026-03-07 11:45:00'),
(19,19,160.00,'WALLET','SUCCESS','2026-03-07 14:45:00');

INSERT IGNORE INTO penalties (id, booking_id, penalty_type, amount, status) VALUES
(1,1,'OVERSTAY',15.00,'PENDING'),
(2,7,'OVERSTAY',21.25,'PENDING'),
(3,10,'OVERSTAY',41.25,'PENDING'),
(4,13,'OVERSTAY',22.00,'PENDING'),
(5,17,'OVERSTAY',26.25,'PENDING');

INSERT IGNORE INTO reviews (id, buyer_id, parking_space_id, rating, comment) VALUES
(1,7,1,5,'Excellent security and easy entry.'),
(2,7,2,4,'Busy area but very well managed.'),
(3,8,5,5,'Great location for meetings.'),
(4,8,9,4,'Smooth booking process.'),
(5,9,14,5,'Clean facility and responsive lender.'),
(6,10,20,4,'Good smart access experience.');

INSERT IGNORE INTO transactions (id, wallet_id, booking_id, amount, transaction_type) VALUES
(1,7,1,180.00,'DEBIT'),
(2,7,2,150.00,'DEBIT'),
(3,7,3,165.00,'DEBIT'),
(4,8,6,195.00,'DEBIT'),
(5,8,7,170.00,'DEBIT'),
(6,9,11,285.00,'DEBIT'),
(7,10,17,315.00,'DEBIT'),
(8,7,1,15.00,'PENALTY'),
(9,8,7,21.25,'PENALTY'),
(10,10,17,26.25,'PENALTY');

INSERT IGNORE INTO notifications (id, user_id, title, message, is_read) VALUES
(1,7,'Booking Confirmed','Your booking #1 is confirmed.',0),
(2,7,'Penalty Applied','Penalty added for booking #1 due to overstay.',0),
(3,8,'Booking Confirmed','Your booking #7 is confirmed.',0),
(4,9,'Payment Success','Payment recorded for booking #11.',1),
(5,10,'Booking Pending','Booking #20 is awaiting payment.',0),
(6,2,'New Booking','A buyer booked Marina Bay Parking.',0),
(7,3,'New Booking','A buyer booked MG Road Metro Parking.',0),
(8,4,'New Booking','A buyer booked Banjara Hills Elite Parking.',0),
(9,5,'New Booking','A buyer booked Nariman Point Garage.',1),
(10,6,'New Booking','A buyer booked Electronic City Tower Parking.',0);
