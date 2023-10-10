package gamestate

import "math/rand"

type Player struct {
	PlayerNumber int    `json:"player_number"`
	DisplayName  string `json:"display_name"`
	Row          int    `json:"row"`
	Col          int    `json:"col"`
}
type GameState struct {
	Players []Player `json:"players"`
	Cells   [][]string
}

func (gs *GameState) InitialiseMap() {
	for i, row := range template {
		gs.Cells = append(gs.Cells, []string{})
		for _, v := range row {
			if v == "" {
				chance := rand.Intn(100)
				if chance < 90 {
					gs.Cells[i] = append(gs.Cells[i], "1")
				} else {
					gs.Cells[i] = append(gs.Cells[i], v)
				}
			} else {
				gs.Cells[i] = append(gs.Cells[i], v)
			}
		}
	}
}

func (gs *GameState) AddPlayer(id int, name string) {
	var row, col int
	switch id {
	case 0:
		row, col = 1, 1
		break
	case 1:
		row, col = 1, 13
		break
	case 2:
		row, col = 11, 1
		break
	case 3:
		row, col = 11, 13
		break
	}
	gs.Players = append(gs.Players, Player{
		PlayerNumber: id,
		DisplayName:  name,
		Row:          row,
		Col:          col,
	})
}

func (gs *GameState) ChangePlayerPosition(playerNum, row, col int) {
	gs.Players[playerNum].Row = row
	gs.Players[playerNum].Col = col
}
