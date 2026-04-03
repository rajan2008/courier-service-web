ALTER TABLE shipments
ADD COLUMN user_id INT REFERENCES users(id);
