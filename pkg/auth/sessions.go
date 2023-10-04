package auth

import (
	"log"
	"net/http"
	"time"

	"github.com/gofrs/uuid"
)

/*
Returns the cookie value of the current session that gives a sessions ID.  Used to determine which user is using the program.
*/

const timeout = 30 * time.Minute

func GetSessionFromBrowser(w http.ResponseWriter, r *http.Request) (string, error) {
	session, err := r.Cookie("session")

	if err != nil {
		return "", err
	}

	value := session.Value
	return value, err
}

/*
Creates session that gives a sessions ID, used to determine which user is using the program.
*/
func CreateUserSession(w http.ResponseWriter, r *http.Request) {
	UUID := GenerateUUIDString()
	sessionId := UUID
	cookie := http.Cookie{
		Name:     "session",
		Value:    sessionId,
		Expires:  time.Now().Add(timeout),
		HttpOnly: true,
		Path:     "/",
	}
	http.SetCookie(w, &cookie)
}

func GenerateUUIDString() string {
	UUID, err := uuid.NewV4()
	if err != nil {
		log.Println("error creating uuid: %w", err)
	}
	return UUID.String()
}
