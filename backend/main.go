package main

import (
	"eatit/backend/database"
	"fmt"
	"net/http"
)

func helloWorld(w http.ResponseWriter, r *http.Request) {

	fmt.Fprintf(w, "Hello World!")
}

func createOrder(w http.ResponseWriter, r *http.Request)(error) {
	db, err := database.GetDb()
	if err != nil {
		return err
	}
	db.Query("INSERT INTO order (restaurants) VALUES ("+r.FormValue("restaurants")+")")
	return nil
}

func main() {
	_, err := database.GetDb()
	if err != nil {
		fmt.Println(err)
		return
	}

	http.HandleFunc("/", helloWorld)
	http.
	http.ListenAndServe(":8080", nil)
}
