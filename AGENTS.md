### General Description
- Hattrick Manager is a web application where I can track the evolution of my players in the hattrick.org game.


### Configuration
- There's a .env file with the CHPP_CONSUMER_KEY, CHPP_CONSUMER_SECRET, CHPP_ACCESS_TOKEN, CHPP_ACCESS_TOKEN_SECRET and CHPP_TEAM_ID.


### The database
- There's a local DB so it's not necessary to load the data always from the hattrick server.

- Is important that the data support changes. I suggest that the basic data is a combination of player_id, field_name, old_value, new_value, last_value?, changed_at.

- Everytime we retrieve the information of from hattrick servers (using `file=players&version=2.7`), the local data should be updated if player field changes.


### The UI

- The main UI is a table with all the players of my team.
- The user could sort each column
- The user, in a configuration page, could change, for each field, the header name, whether is displayed or not, and in which order in the table it's displayed
- Every configuration should be persisted locally in the browser
- There's a button to fetch new changes from the hattrick server