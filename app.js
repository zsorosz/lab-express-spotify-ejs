require("dotenv").config();

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const SpotifyWebApi = require("spotify-web-api-node");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

const app = express();

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/artist-search", (req, res) => {
  spotifyApi
    .searchArtists(req.query.searchTerm)
    .then((data) => {
      const artistArray = data.body.artists.items;
      res.render("artist-search-results", { artistArray });
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});

app.get("/albums/tracks/:albumId", (req, res, next) => {
  spotifyApi.getAlbumTracks(req.params.albumId, { limit: 5, offset: 1 }).then(
    function (data) {
      const allTracks = data.body.items;
      res.render("tracks", { allTracks });
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );
});

app.get("/albums/:artistId", (req, res, next) => {
  spotifyApi.getArtistAlbums(req.params.artistId).then(
    function (data) {
      const allAlbums = data.body.items;
      console.log(allAlbums[0].artists);
      res.render("albums", { allAlbums });
    },
    function (err) {
      console.error(err);
    }
  );
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
