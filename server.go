package main

import (
	"bomberman_server/pkg/websocket"
	"html/template"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

var tmpl *template.Template

func init() {
	tmpl = template.Must(template.ParseGlob("static/*.html"))
}

func main() {
	r := mux.NewRouter()

	srv := &http.Server{
		Handler:      r,
		Addr:         "localhost:8080",
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	hub := websocket.NewHub()
	go hub.Run()

	// Serve static files (e.g., your game's HTML, CSS, and JavaScript files)
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	r.PathPrefix("/static/js/").Handler(http.StripPrefix("/static/js/", http.FileServer(http.Dir("static/js"))))
	r.PathPrefix("/static/css/").Handler(http.StripPrefix("/static/css/", http.FileServer(http.Dir("static/css"))))

	r.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tmpl.ExecuteTemplate(w, "index.html", nil)
	}))

	r.Handle("/game", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tmpl.ExecuteTemplate(w, "game.html", nil)
	}))

	/*WEBSOCKET*/
	r.Handle("/ws", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		websocket.ServeWs(hub, w, r)
	}))

	/*LISTEN AND SERVER*/
	log.Printf("Server running on %s", srv.Addr)
	log.Fatal(srv.ListenAndServe())
}
