package database

import (
	"database/sql"
	"errors"
	"os"

	_ "github.com/lib/pq"
)

var db *sql.DB

func GetDb() (*sql.DB, error) {
	var err error = nil

	if db == nil {
		connString := os.Getenv("DATABASE_URL")
		if connString == "" {
			connString = "postgres://localhost:5432"
		}
		db, err = sql.Open("postgres", connString)
	}

	return db, err
}

func CloseDb() (error) {
	if db != nil {
		db.Close()
		return nil
	}

	return errors.New("no database connection to close")
}
