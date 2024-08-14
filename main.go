package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
	"sync"

	"log"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
    "github.com/gofiber/fiber/v3/middleware/static"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

const last_match_commander_query = `select p.username as username, f.name as faction_name, f1.name as winning_faction, ra."ELO" as elo, ma.match_length as match_length, map.name as map_name
    FROM matches_players_commander m, players p, matches ma, rankings_commander ra, factions f, factions f1, maps map
    WHERE m.match_id = (SELECT MAX(match_id)
    FROM matches_players_commander)
    AND map.id = ma.maps_id
    AND m.match_id = ma.id
    AND ra.player_id = p.id
    AND ra.faction_id = m.faction_id
    AND f.id = m.faction_id
    AND f1.id = ma.match_won_faction_id
    AND p.id = m.player_id`

const last_match_player_query = `select p.username as username, f.name as faction_name, m.total_points as total_points
FROM matches_players_fps m, players p, factions f
WHERE m.match_id = (SELECT MAX(match_id) FROM matches_players_fps)
AND p.id = m.player_id
AND f.id = m.faction_id
ORDER BY m.total_points DESC`

const commander_elo_leaderboard_query = `
SELECT p.username as username, f.name as faction_name, rc."ELO" as elo, p.steam_id as steam_id, 1 as avatar
FROM players p, factions f, rankings_commander rc
WHERE rc.player_id = p.id AND f.id = rc.faction_id
ORDER BY rc."ELO" DESC
LIMIT 500;
`
const player_total_leaderboard_query = `
SELECT p.username as username, f.name as faction_name, SUM(rc.total_points) as total_points, COUNT(rc.total_points) as num_matches, p.steam_id as steam_id, SUM(rc.total_points)/COUNT(rc.total_points) as avg, 1 as avatar
FROM players p, factions f, matches_players_fps rc
WHERE rc.player_id = p.id AND f.id = rc.faction_id
GROUP BY (f.name, p.username, p.steam_id)
ORDER BY SUM(rc.total_points) DESC
LIMIT 500;
`

const player_avg_leaderboard_query = `select p.username as username, f.name as faction_name, SUM(rc.total_points)/COUNT(rc.total_points) as avg, COUNT(rc.total_points) as num_matches
from players p, factions f, matches_players_fps rc 
where rc.player_id = p.id AND f.id = rc.faction_id AND rc.total_points <> 0 
GROUP BY (f.name, p.username) 
HAVING COUNT(rc.total_points) > 10
ORDER BY SUM(rc.total_points)/COUNT(rc.total_points) DESC;`

type Player struct {
	SteamID string `json:"steamid"`
	Avatar  string `json:"avatar"`
}

// Response represents the full structure containing the players.
type Response struct {
	Players []Player `json:"players"`
}

// Root represents the root structure of the JSON.
type Root struct {
	Response Response `json:"response"`
}

type last_match_commander_record struct {
	UserName      string `db:"username"`
	FactionName   string `db:"faction_name"`
	WinnerFaction string `db:"winning_faction"`
	ELO           int32  `db:"elo"`
	MatchLength   int32  `db:"match_length"`
	MapName       string `db:"map_name"`
}

type last_match_player_record struct {
	UserName    string `db:"username"`
	FactionName string `db:"faction_name"`
	TotalPoints string `db:"total_points"`
}

type commander_elo_record struct {
	UserName    string `db:"username"`
	FactionName string `db:"faction_name"`
	ELO         string `db:"elo"`
	SteamID     string `db:"steam_id"`
	Avatar     string `db:"avatar"`
}

type player_total_score_record struct {
	UserName      string `db:"username"`
	FactionName   string `db:"faction_name"`
	TotalPoints   string `db:"total_points"`
	NumberMatches string `db:"num_matches"`
	Average       string `db:"avg"`
	Avatar       string `db:"avatar"`
	SteamID     string `db:"steam_id"`
}

type player_avg_score_record struct {
	UserName      string `db:"username"`
	FactionName   string `db:"faction_name"`
	TotalPoints   string `db:"total_points"`
	NumberMatches string `db:"num_matches"`
	Average       string `db:"avg"`
}

func update_commmander_leaderboard(db *sqlx.DB, chan_commander_leaderboard chan map[string]interface{}) {
	commander_details := make(chan []commander_elo_record)
	for {
		go func() {
			commanders := []commander_elo_record{}
			err := db.Select(&commanders, commander_elo_leaderboard_query)
			if err != nil {
				log.Fatal(err)
			}

			requested_ids := make(map[string]string, len(commanders))
			for _, i := range commanders {
				_, ok := requested_ids[i.SteamID]
				if !ok {
					requested_ids[i.SteamID] = ""
				}
			}
            waitChannel := make(chan interface{})
			go func() {get_all_steam_images(requested_ids, waitChannel)}()
            <-waitChannel
            for index := range(len(commanders)) {
                commanders[index].Avatar = requested_ids[commanders[index].SteamID]
            }
			commander_details <- commanders
		}()
		data := map[string]interface{}{
			"commanders": <-commander_details,
			"updated_at": time.Now(),
		}
		// WARNING I am not sure if this is correct? but it works? this is not exactly correct. The wait in seconds doesnt take into account waiting for the item. Do something about it, like a channel
		go func() {
			select {
			case <-chan_commander_leaderboard:
			default:
			}
			chan_commander_leaderboard <- data
			log.Println("data sent from commander leaderboard")
		}()
		time.Sleep(60 * time.Minute)

	}
}

func get_all_steam_images(requested_ids map[string]string, waitChannel chan interface{}) {

	//unique_ids := make(map[string]string)
	steam_api_key := os.Getenv("STEAM_API_KEY")

	all_keys := make([]string, 0, len(requested_ids))
	for key := range requested_ids {
		all_keys = append(all_keys, key)
	}

    var wg sync.WaitGroup

    var mutex sync.Mutex

	batch := 100
	for i := 0; i < len(all_keys); i += batch {
        wg.Add(1)
		// 100 is limit in batch requests
		j := i + batch
		if j > len(all_keys) {
			j = len(all_keys)
		}
		ids_to_request := strings.Join(all_keys[i:j], ",")
		//fmt.Println(ids_to_request)
		go func() {
            defer wg.Done()
			request_id := fmt.Sprintf("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=%s&steamids=%s", steam_api_key, ids_to_request)
			resp, err := http.Get(request_id)
			if resp.StatusCode != http.StatusOK {
				log.Printf("Error: status code %d", resp.StatusCode)
			}

			defer resp.Body.Close()
			body, err := io.ReadAll(resp.Body)
			if err != nil {
				log.Printf("Failed to read response body: %v", err)
			}
			var j Root
			err = json.Unmarshal(body, &j)
			if err != nil {
				log.Printf("Failed to unmarshal json due to: %v", err)
			}
            mutex.Lock()
            for _, player := range(j.Response.Players) {
                requested_ids[player.SteamID] = player.Avatar
            }
            mutex.Unlock()
		}()
	}

    wg.Wait()
    waitChannel <- struct{}{}
}

func update_player_leaderboard(db *sqlx.DB, chan_player_leaderboard chan map[string]interface{}) {
	// NOTE add context stuff to safely close the channels
	//player_avg_score_channel := make(chan []player_avg_score_record)
	player_total_score_channel := make(chan []player_total_score_record)
	for {
		//go func() {
			//player_avg_scores := []player_avg_score_record{}
			//err := db.Select(&player_avg_scores, player_avg_leaderboard_query)
			//if err != nil {
				//log.Fatal(err)
			//}
			//player_avg_score_channel <- player_avg_scores
		//}()
		go func() {
			player_total_scores := []player_total_score_record{}
			err := db.Select(&player_total_scores, player_total_leaderboard_query)
			if err != nil {
				log.Fatal(err)
			}


			requested_ids := make(map[string]string, len(player_total_scores))
			for _, i := range player_total_scores {
				_, ok := requested_ids[i.SteamID]
				if !ok {
					requested_ids[i.SteamID] = ""
				}
			}

            waitChannel := make(chan interface{})
            go func() {get_all_steam_images(requested_ids, waitChannel)}()
            <-waitChannel
            for index := range(len(player_total_scores)) {
                player_total_scores[index].Avatar = requested_ids[player_total_scores[index].SteamID]
            }
			player_total_score_channel <- player_total_scores
		}()
		data := map[string]interface{}{
			//"players_avg":   <-player_avg_score_channel,
			"players_total": <-player_total_score_channel,
			"updated_at":    time.Now(),
		}

		// WARNING I am not sure if this is correct? but it works? this is not exactly correct. The wait in seconds doesnt take into account waiting for the item. Do something about it, like a channel
		go func() {
			select {
			case <-chan_player_leaderboard:
			default:
			}
			chan_player_leaderboard <- data
			log.Println("data sent from player leaderboard")
		}()
		time.Sleep(60 * time.Minute)

	}
}

func update_last_match_stats(db *sqlx.DB, chan_last_match_stats chan map[string]interface{}) {
	last_match_commander_channel := make(chan []last_match_commander_record)
	last_match_player_total_score_channel := make(chan []last_match_player_record)
	for {
		go func() {
			last_match_commanders := []last_match_commander_record{}
			err := db.Select(&last_match_commanders, last_match_commander_query)
			if err != nil {
				log.Fatal(err)
			}
			last_match_commander_channel <- last_match_commanders
		}()
		go func() {
			player_total_scores := []last_match_player_record{}
			err := db.Select(&player_total_scores, last_match_player_query)
			if err != nil {
				log.Fatal(err)
			}
			last_match_player_total_score_channel <- player_total_scores
		}()
		data := map[string]interface{}{
			"players_avg":   <-last_match_commander_channel,
			"players_total": <-last_match_player_total_score_channel,
			"updated_at":    time.Now(),
		}
		go func() {
			select {
			case <-chan_last_match_stats:
			default:
			}
			chan_last_match_stats <- data
			log.Println("data sent from last match stats")
		}()
		time.Sleep(30 * time.Minute)

	}
}

func main() {
	godotenv.Load(".env")
	fmt.Println("Hello Worlds. Stop thinking about it")
    port := os.Getenv("PORT")
    if port == "" {
        port = "4000"
    }
    fmt.Println(port)

	app := fiber.New()


    if os.Getenv("ENV") == "production" {
        app.Use("/", static.New("./client/dist"))
    } else {
        app.Use(cors.New(cors.Config{
            AllowOrigins: []string{"http://localhost:5173"},
            AllowHeaders: []string{"Orgin,Content-Type,Accept"},
        }))
    }
	app.Get("/", func(c fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{"msg": "hello world"})
	})



	connStr := os.Getenv("DATABASE_URL")
	db, err := sqlx.Connect("postgres", connStr)

    db.SetMaxOpenConns(1000)
    db.SetMaxIdleConns(5)
    db.SetConnMaxLifetime(0)

	if err != nil {
		log.Fatal(err)
	}

	commmander_leaderboard_channel := make(chan map[string]interface{})
	commmander_leaderboard_data := make(map[string]interface{})

	player_leaderboard_channel := make(chan map[string]interface{})
	player_leaderboard_data := make(map[string]interface{})

	last_match_stat_channel := make(chan map[string]interface{})
	last_match_stat_data := make(map[string]interface{})
	println("Connected to the database")

	go func() {
		update_commmander_leaderboard(db, commmander_leaderboard_channel)
	}()

	go func() {
		update_player_leaderboard(db, player_leaderboard_channel)
	}()

	go func() {
		update_last_match_stats(db, last_match_stat_channel)
	}()

	app.Get("/api/last_match", func(c fiber.Ctx) error {
		select {
		case last_match_stat_data = <-last_match_stat_channel:
		default:
		}
		return c.Status(200).JSON(last_match_stat_data)
	})

	app.Get("/api/commander_leaderboard", func(c fiber.Ctx) error {
		select {
		case commmander_leaderboard_data = <-commmander_leaderboard_channel:
		default:
		}
		return c.Status(200).JSON(commmander_leaderboard_data)
	})

	app.Get("/api/player_leaderboard", func(c fiber.Ctx) error {
		select {
		case player_leaderboard_data = <-player_leaderboard_channel:
		default:
		}
		return c.Status(200).JSON(player_leaderboard_data)
	})


    log.Fatal(app.Listen("0.0.0.0:" + port))
	close(commmander_leaderboard_channel)
	close(player_leaderboard_channel)
	close(last_match_stat_channel)
	app.ShutdownWithTimeout(10 * time.Second)
}
