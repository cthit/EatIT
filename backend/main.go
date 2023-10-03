package main

import (
	"eatit/backend/database"
	"fmt"
	"net/http"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"strconv"
)

type Order struct{
	order_id int
	restaurants []string
	order_name string
 }

 type Item struct{
	item_id int
	order_id int
	name string
	buyer string
 }

func helloWorld(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello World!")
}

func createOrder(w http.ResponseWriter, r *http.Request) {




	db, err := database.GetDb()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Oopsie woopsie UwU - Something bad happened, hehe!"))
		return
	}

	db.Query("INSERT INTO order (restaurants, order_name) VALUES ("+r.FormValue("restaurants")+","+r.FormValue("order_name")+")")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Order created!"))
	return
}

func addOrderItem(w http.ResponseWriter, r *http.Request) {


	 db, err := database.GetDb()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Oopsie woopsie UwU - Something bad happened, hehe!"))
		return
	}

	potRows,err := db.Query("SELECT * FROM order WHERE order_name="+r.FormValue("order_name"))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Oopsie woopsie UwU - that order doesn't seem to exist yet!"))
	}
	defer potRows.Close()
	var ord Order
	potRows.Scan(&ord.order_id)
	pottedRows, err := db.Query("SELECT * from item WHERE order_id="+strconv.Itoa(ord.order_id)+" AND item_name="+r.FormValue("item_name"))
	if err != nil {
		// Else, create item and add buyer
		db.Query("INSERT INTO item (order_id, item_id, buyer) VALUES ("+r.FormValue("order_id")+","+r.FormValue("item_id")+","+r.FormValue("buyer")+")")
	}
	defer pottedRows.Close()
	var item Item
	pottedRows.Scan(&item.item_id)
	// If item exist, add buyer
	t, err := db.Query("UPDATE item ADD" + /*Hope this works?*/" buyer = "+r.FormValue("buyer")+" WHERE order_id = "+r.FormValue("order_id")+" AND item_id = "+strconv.Itoa(item.item_id))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Oopsie woopsie UwU - Something bad happened, hehe!"))
		return
	}
	defer t.Close()
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Order item added!"))
	return
}

func main() {
	_, err := database.GetDb()
	if err != nil {
		fmt.Println(err)
		return
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Get("/", helloWorld)
	r.Post("/order/create", createOrder)
	r.Post("/order/add", addOrderItem)
	http.ListenAndServe(":8080", r)
}
