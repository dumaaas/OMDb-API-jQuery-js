//sakrijemo dio za prikazivanje filma/serije kada otvorimo stranicu
$(document).ready(function() {
    $('#movie-show').hide();
});

//funkcija za pretragu filmova
function searchMovies() {
    //ispraznimo polja za validaciju kada pritisnemo dugme za pretragu
    $('#validate-name').empty();
    $('#validate-category').empty();

    //ispraznimo trenutne filmove i broj filmova ukoliko postoje kada pritisnemo dugme za pretragu
    $('#movie-div').empty();
    $('#movies-num').empty();

    //pokupimo vrijednosti inputa i selecta koji su potrebni za slanje GET zahtjeva prema APi-u
    let name = $("#query-name").val();
    let category = $("#query-category").val();
    let year = $("#query-year").val();

    //selectujemo div sa svim filmovima kako bi nakon pretrage izvrsili tranziciju
    const transition = document.getElementById('movie-div');
    transition.style.opacity = 0;

    //u slucaju da je ime za pretragu prazno ili ako  nismo selektovali kategoriju, izvrsavamo validaciju
    if (name.length == 0 || category == null) {

        if (name.length == 0) {
            $('#validate-name').append('<p style="color:red;font-size:13px;">Name must be filled out!</p>');
        }
        if (category == null) {
            $('#validate-category').append('<p style="color:red;font-size:13px;">You must select category!</p>');
        }

        //takodje ukoliko neki od gornjih uslova nije ispunjen, ispisujemo poruku iznad filmova i izvrsava se animacija poruke
        $('#movies-num').append('Oops! Try again. :)');
        animate();
        return;
    };

    //ajax request prema API-u gdje izvlacimo sve elemente koji ispunjavaju uslove pretrage
    $.ajax({

        type: "GET",
        url: "http://www.omdbapi.com/?apikey=39c93cf7&s=" + name + "&type=" + category + "&y=" + year,
        success: (response) => {

            let movies = response.Search;

            //ukoliko je vrijednosti Response-a = True, prikazujemo rezultate
            if (response.Response == "True") {

                transition.style.opacity = 1;
                transition.style.transition = 'all 3s ease-in-out';

                $('#movies-num').append('Found ' + movies.length + ' results in total');
                animate();

                //prolazimo kroz niz elemenata koji smo dobili i prikazujemo jedan po jedan
                movies.forEach(movie => {

                    //ukoliko je vrijednost slike nepoznata, prikazujemo default sliku iz naseg foldera
                    if (movie.Poster == "N/A") {
                        movie.Poster = "./Images/default.jpg";
                    }

                    $('#movie-div')
                        .append(
                            '<div class="movie-content">' +
                            '<div class="flip-card">' +
                            '<div class="flip-card-inner">' +
                            '<div class="flip-card-front">' +
                            '<img src=' + movie.Poster + '></img>' +
                            '</div>' +
                            '<div class="flip-card-back">' +
                            '<img src=' + movie.Poster + '></img>' +
                            '</div>' +
                            '<div class="center">' +
                            '<div class="back-text">' +
                            '<a target="_blank" class="movie-imdb" href="https://www.imdb.com/title/' + movie.imdbID + '"><i class="fab fa-imdb"></i>       </a>' +
                            '<a target="_blank" class="movie-imdb" href="' + movie.Poster + '"><i class="fas fa-image"></i></a>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '<div class="movie-details">' +
                            '<div class="movie-name">' +
                            '<a id="movie-title" onClick="openMovie(\'' + movie.imdbID + '\')">' + movie.Title + '</a>' +
                            '<hr>' +
                            '</div>' +
                            '<p class="movie-year"> Release year:  ' + movie.Year + '</p>' +
                            '<p class="movie-year"> Type:  ' + movie.Type + '</p>' +
                            '<hr>' +
                            '</div>' +
                            '</div>'
                        )
                })

                //ukoliko je vrijednost Responsa razlicita od True, znaci da uslovi za pretragu nisu ispunjeni i prikazemo odgovarajucu poruku
            } else {

                $('#movies-num').append('Hmm.. it seems we can not find what are you looking for. :(');
                animate();

            }
        }
    })
}

//film/serija se otvara nakon klika na ime odredjenog elementa iz ponudjene liste
//svaki link sadrzi funkciju openMovie i kao argument se salje imdbID 
//pretraga se izvrsava po imdbID-u, jer kada se izvrsava po titlu, ne otvori uvijek trazeni film (u slucaju da ima vise filmova sa istim naslovom) - na ovaj nacin je jedinstvenije
function openMovie(query) {

    //kada otvorimo odredjeni film/seriju sakrijemo elemente koji su do sada bili prikazani i prikazemo div za film
    $("#content").hide();
    $("#top-part").hide();
    $("#movie-show").show();

    //ukoliko prikazemo neki film pa se vratimo na pretragu i otvorimo novi, prikazali bi se rezultati oba filma u div-u movie-show
    //zbog toga pozivamo pomocnu funkciju cleanMovie() kako bi ispraznili sve elemente movie-showa ukoliko su vec bili popunjeni
    cleanMovie();

    //div series-season se koristi prilikom prikaza odredjene epizode i on nam nije potreban kada prikazujemo film ili seriju
    //iz tog razloga ga ispraznimo kako se ne bi prikazivao bez kad je potreban
    $('#series-season').empty();

    //ajax reuquest prema API-u gdje izvlacimo podatke o odredjenom filmu/seriji
    $.ajax({
        type: "GET",
        url: "http://www.omdbapi.com/?apikey=39c93cf7&i=" + query,
        success: (response) => {
            //pomocna funkcija koja popunjava elemente potrebne za prikaz filma/serije
            showMovie(response);
        }
    })
}

//OMDb API sazdrzi i type -> episode.. da bi otvorili epizodu koju zelimo potrebni su nam naziv serije, sezona i epizoda koju zelimo da otvorimo
//Epizode mozememo otvoriti prilikom ulaska u odredjenu seriju, gdje mozemo vidjeti sve epizode iz razlicitih sezona
//Klikom na naziv odredjene epizode izvrsava se openEpisode funckija i prikazuju se podaci vezani za epizodu
function openEpisode(title, season, episode) {

    //ispraznimo elemente serije na koju se epizoda odnosi kako bi prikazali elemente epizode
    cleanMovie();

    //pozovemo pomocnu funckiju getSeason kako bi i na prikazu epizode imali prikaz svih epizoda i sezona te serije
    getSeason(title, season)

    //ajax request prema API-u gdje izvlacimo podatke o odredjenoj epizodi
    $.ajax({
        type: "GET",
        url: "http://www.omdbapi.com/?apikey=39c93cf7&i=" + title + "&season=" + season + "&episode=" + episode,
        success: (response) => {
            //prikazemo rezultate odredjene epizode
            showMovie(response);
        }
    })
}

//pomocna funkcija showMovie koja se izvrsava kada dobijemo podatke od strane API-a
function showMovie(response) {
    let movie = response;

    //neki filmovi/serije imaju vise rezisera, glumaca i zanrova i da bi ljepse mogli da ih prikazemo na stranici od stringa koji dobijemo napravimo niz elemenata
    var str = movie.Actors;
    var str2 = movie.Director;
    var str3 = movie.Genre;

    var stars = str.split(", ");
    var directors = str2.split(", ");
    var genres = str3.split(", ");

    //ukoliko nemamo podatke o slici prikazemo default sliku iz foldera
    if (movie.Poster == "N/A") {
        movie.Poster = "./Images/default.jpg";
    }

    //prikazujemo redom podatke
    $("#movie-title-name").append(movie.Title + ' <span id="movie-year"></span>');
    $("#movie-year").append(movie.Year);

    //ukoliko IMDb ocjene nisu dostupne, prikazemo odgovarajucu poruku
    if (movie.imdbRating === 'N/A') {
        $("#movie-rating").append('<span>Ratings are not available<span>');
    } else {
        $("#movie-rating").append(movie.imdbRating + '/10  <span>' + movie.imdbVotes + ' votes </span>');
    }

    $("#img").append('<img src=' + movie.Poster + ' alt="">');

    if (movie.Plot === 'N/A') {
        $('#movie-description').append('Plot is not available at this moment. :)');
    } else {
        $('#movie-description').append(movie.Plot);
    }

    directors.forEach(director => {
        $('#movie-director').append('<p>' + director + '</p>');
    });

    stars.forEach(star => {
        $('#movie-stars').append('<p>' + star + '</p>');
    });

    genres.forEach(genre => {
        $('#movie-genre').append('<p>' + genre + '</p>');
    });

    $('#movie-released').append(movie.Released);
    $('#movie-runtime').append(movie.Runtime);

    //ukoliko je Type -> serija onda prikazemo ukupan broj sezona 
    //prikazemo i select sa svim sezonama te serije gdje na klik mozemo prikazati sve epizode odredjene sezone
    //po defaultu je selectovana poslednja sezona serije, kako bi odmah pri ulasku u seriju imali izlistane epizode 
    if (movie.Type == 'series') {
        $('#movie-seasons').append('<h3>Seasons:</h3><p>' + movie.totalSeasons + '</p>');

        $('#series-season').append(
            '<p class="heading-des">Episodes>      ' +
            '<select onchange="getSeason(\'' + movie.Title + '\')" id="select-episodes">' +
            '</select>' +
            '</p>' +
            '<hr class="about">' +
            '<div class="description">' +
            '<div id="episodes">' +
            '</div>' +
            '</div>'
        )
    }

    $('#movie-cast').append(
        '<p>Director: ' + movie.Director + '</p>' +
        '<p>Writer: ' + movie.Writer + '</p>' +
        '<p>Stars: ' + movie.Actors + '</p>'
    )

    if (movie.Ratings.length == 0) {
        $('#movie-reviews').append('<p>Ratings are not available at this moment. :)</p>')
    } else {
        movie.Ratings.forEach(rating => {
            $('#movie-reviews').append('<p>' + rating.Source + ' --> ' + rating.Value + '</p>')
        });
    }

    if (movie.Awards === 'N/A') {
        $('#movie-awards').append('Awards are not available at this moment. :)');
    } else {
        $('#movie-awards').append(movie.Awards);
    }

    $('#movie-imdb-btn').append(
        '<button onClick="openImdbPage(\'' + movie.imdbID + '\')" class="btn-imdb">' +
        '<i class="fab fa-imdb"></i> IMDb' +
        '</button>'
    )

    //za ukupan broj sezona serije ispunimo select sa tolikim brojem opcija
    for (i = 1; i <= movie.totalSeasons; i++) {
        $('#select-episodes').append(
            '<option selected="selected" value="\'' + i + '\'">Season ' + i + '</option>'
        )
    }

    if (movie.Type === "series") {

        //prikazemo sve epizode selektovane sezone
        getSeason(movie.Title);

    }

    //ukoliko smo otvorili epizodu prikazemo na stranici na kojoj smo epizodi i sezoni 
    //i prikazemo dugme za povratak na seriju
    if (movie.Type === "episode") {
        $("#episode-details").append(
            '<span class="episode-span">Season ' + movie.Season + '      </span>' +
            '<span class="season-span">Episode ' + movie.Episode + '</span>'
        )
        $("#button-tvshow").append(
            '<button onClick="openMovie(\'' + movie.seriesID + '\')" class="btn-search">' +
            '<i class="fas fa-chevron-left"></i>' +
            ' Back to TV Show' +
            '</button>'
        )
    }
}

//pomocna funckija getSeason koja izvrsava request prema API-u kako bi dobila podatke o epizodama te sezone
function getSeason(title) {

    //ispraznimo epizode kako bi prikazali  nove
    $("#episodes").empty();

    //pokupimo vrijednost iz selecta o sezoni koja nam je potrebna za GET zahtjev
    let val = $("#select-episodes").val();

    //select uvijek vrace vrijednost sezone u obliku (nprm '1', '2') sto ne odgovara zahtjevu
    //pa je potrebno izbrisati navodnike koji se uvijek nalaze na prvom i poslednjem mjestu stringa
    let season = val.substring(1, val.length - 1);

    //ajax request prema API-ju koji vraca podatke o epizodama
    $.ajax({

        type: "GET",
        url: "http://www.omdbapi.com/?apikey=39c93cf7&t=" + title + "&season=" + season,
        success: (response) => {

            let season = response.Episodes;

            //prodjemo kroz niz epizoda koji smo dobili i prikazujemo jednu po jednu
            season.forEach(episode => {

                $('#episodes').append(
                    '<p>' + episode.Episode + '. <a href="#" class="episode-link" onClick="openEpisode(\'' + response.Title + '\', \'' + response.Season + '\', \'' + episode.Episode + '\')">' + episode.Title + '</a>, ' + episode.Released + ', ' + episode.imdbRating + '/10</p>'
                )

            })
        }
    })
}

//pomocna funkcija koja nam otvara novi prozor koji nas vodi do imdb stranice filma/serije/epizode
function openImdbPage(imdb) {

    var imdbPage = window.open('https://www.imdb.com/title/' + imdb, '_blank');

    if (imdbPage) {
        imdbPage.focus();
    } else {
        alert('Please allow popups for this website');
    }
}

//pomocna funckija animate koja resetuje animaciju kako bi se izvrsavala svaki put nakon pretrage
function animate() {
    let animation = document.getElementById('movies-num');
    animation.style.animation = 'none';
    animation.offsetHeight;
    animation.style.animation = null;
}

//pomocna funkcija koja nas vraca do pretrage svih filmova 
function goBack() {
    $("#content").show();
    $("#top-part").show();
    $("#movie-show").hide();
    cleanMovie();
}

//pomocna funkcija cleanMovie() koju koristimo da isprazni sve elemente filma/serije/epizode 
function cleanMovie() {
    $("#movie-title-name").empty();
    $("#movie-year").empty();
    $("#movie-rating").empty();
    $("#img").empty();
    $('#movie-description').empty();
    $('#movie-director').empty();
    $('#movie-stars').empty();
    $('#movie-genre').empty();
    $('#movie-released').empty();
    $('#movie-runtime').empty();
    $('#movie-seasons').empty();
    $('#movie-cast').empty()
    $('#movie-reviews').empty()
    $('#movie-awards').empty();
    $('#movie-imdb-btn').empty();
    $("#episodes").empty();
    $("#episode-details").empty();
    $("#button-tvshow").empty();
}

//ukoliko ime nije bilo ispunjeno nakon pretrage pojavice se validaciona greska
//pomocna funkcija koja se koristi u slucaju da je korisnik poceo da popunjava polje ime, a imao je validacionu gresku
//kako bi validaciona greska odmah nestala
function clearErrors() {
    $('#validate-name').empty();
}

//slicno kao gornja pomocna funkcija
function clearCategoryErrors() {
    $('#validate-category').empty();
}

//ukoliko korisnik pritisne enter dok se nalazi u input poljima za ime i godinu, automatski se izvrsava funckija za pretragu 
$('#query-name').keypress(function(e) {
    if (e.which == 13) {
        searchMovies();
        return false;
    }
});

$('#query-year').keypress(function(e) {
    if (e.which == 13) {
        searchMovies();
        return false;
    }
});