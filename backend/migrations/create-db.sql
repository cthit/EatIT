CREATE TABLE IF NOT EXISTS "order" (
	 order_id SERIAL PRIMARY KEY,
	 created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	 updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	 restaurants TEXT[]
);

CREATE TABLE IF NOT EXISTS "item" (
	 item_id SERIAL PRIMARY KEY,
	 name TEXT NOT NULL,
	 price INT,
	 buyer TEXT[],
	 order_id INT NOT NULL,
	 FOREIGN KEY ( order_id ) REFERENCES "order" ( order_id ) ON DELETE CASCADE
);
