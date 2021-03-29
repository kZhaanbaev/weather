const savedList = $('.list-group');
const mainWeather = $('#main-weather');
const forecast = $('#5-day-forecast');

const inputField = $('#input');
const searchBtn = $('#search-button');
const clearBtn = $('#clearBtn');
let cardDeck = $('<div class="row justify-content-around">');

const F = String.fromCharCode(176);

showCityNameFromStorage();

//will delete history from local storage
clearBtn.on('click', function (){
    savedList.children().remove();
    localStorage.clear();
})

searchBtn.on('click', function () {
    let cityName = inputField.val();
    document.getElementById('input').value = '';

    displayWeatherInfo(cityName)   
})

$('ul').on('click', 'li', function(event){
    displayWeatherInfo($(this).text());
})

/**
 * Function will take city name and display all weather information for that city
 * @param {*} cityName 
 */
function displayWeatherInfo(cityName){
    let endPoint = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=6eff42fd74f00dfa17ce2ae0939485b8`;

    //clearing out the weather display section prior adding any elements
    mainWeather.children().remove();

    //fetching data from the API
    fetch(endPoint)
        .then((response) => response.json())
        .then((data) => {
            if (data.cod !== 200) {
                $('#modal').modal('show');
                throw Error(data);
            }

            createWeatherView(data.name, moment().format('L'), data.weather[0].icon.substring(0,2), data.main.temp, data.main.humidity, data.wind.speed);
            
            //fetching UV index, this will be deprecated starting in April, 2021
            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=minutely,hourly,daily,alerts&appid=6eff42fd74f00dfa17ce2ae0939485b8`)
            .then((response) => response.json())
            .then((data) => {
                if (!data) {
                    throw Error(data);
                }
                displayUVindex(data.current.uvi);

                //fetching 5 day forecast
                let endPoint5Days = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=imperial&appid=6eff42fd74f00dfa17ce2ae0939485b8`;

                fetch(endPoint5Days)
                .then((response) => response.json())
                .then((data) =>{
                    if (!data) {
                        throw Error(data);
                    }

                    cardDeck.children().remove();
                    cardDeck.append($('<h2 class="mt-4">5-Day Forecast</h2>'));

                    //taking information for 12 noon only for each day
                    data.list.forEach(function(each){
                        if(each.dt_txt.includes('12:00:00')){
                            displayCard(each.dt_txt.substring(0, 10), each.weather[0].icon.substring(0,2), each.main.temp, each.main.humidity)
                        }
                    });
                    forecast.append(cardDeck);

                })
                .catch(function (error){
                    console.log(error);
                })

            })
            .catch(function (error){
                console.log(error);
            })

            localStorage.setItem('city-' + cityName, cityName);
            showCityNameFromStorage();
        })
        .catch(function (error){
            console.log(error);
        })
}

/**
 * Function will take following details from API and display on the page
 * @param city is name of the city
 * @param date is current date
 * @param icon is code based on what OpenWeatherAPI will get specific icon
 * @param temperature is current temperature
 * @param humidity 
 * @param speed is speed of wind
 */
function createWeatherView(city, date, icon, temperature, humidity, speed){
    let h1 = $(`<h2>${city} (${date}) <img src="http://openweathermap.org/img/wn/${icon}d@2x.png"></h2>`);

    mainWeather.addClass('border border-dark');
    mainWeather.append(h1);

    let temp = $(`<p>Temperature: ${temperature} ${F}F</p>`);
    let hum = $(`<p>Himidity: ${humidity}%</p>`);
    let wind = $(`<p>Wind Speed: ${speed} MPH</p>`);

    mainWeather.append(temp);
    mainWeather.append(hum);
    mainWeather.append(wind);
}

/**
 * Function will set bg-color based on UV index and display on the page
 * @param uv is index
 */
function displayUVindex(uv){
    let uvText = $('<p>UV Index: </p>');

    let uvIndex = $(`<span>&nbsp ${uv} &nbsp</span>`);
    uvIndex.addClass('d-inline p-1');

    if(uv < 2){
        uvIndex.addClass('bg-success');
    }else if(uv < 8){
        uvIndex.addClass('bg-warning')
    }else if(uv < 11){
        uvIndex.addClass('bg-danger')
    }else{
        uvIndex.addClass('bg-info')
    }

    uvText.append(uvIndex);
    mainWeather.append(uvText);
}

/**
 * Function will take parameters and display as a card, used for 5-day forecast
 * @param {*} date 
 * @param {*} icon 
 * @param {*} temperature 
 * @param {*} humidity 
 */
function displayCard(date, icon, temperature, humidity){
    let card = $('<div class="card col-xl-2 col-12 text-nowrap my-5 bg-primary text-light">');

    let body = $('<div class="card-body">');

    let title = $(`<h5 class="card-title">${date}</h5>`);
    let icon_ = $(`<img src="http://openweathermap.org/img/wn/${icon}d@2x.png">`);
    let temp = $(`<p class="card-text">Temp: ${temperature} ${F}F</p>`);
    let hum = $(`<p class="card-text">Humidity: ${humidity}%</p>`);

    body.append(title);
    body.append(icon_);
    body.append(temp);
    body.append(hum);

    card.append(body);
    
    cardDeck.append(card);    
}

/**
 * Function will load all list items with city names from localStorage
 */
function showCityNameFromStorage(){
    savedList.children().remove();
    for(i = 0; i < localStorage.length; i++){
        let key = localStorage.key(i);
        let value = localStorage[key];

        if(key.startsWith('city-')){
            createCityListItem(value.substring(value.indexOf('-')+1));
        }
    }
}

/**
 * Function creates a list item and adds to ul
 * @param {*} cityName 
 */
function createCityListItem(cityName){
    let li = $(`<li class="list-group-item list-group-item-action">${cityName}</li>`);
    savedList.append(li);
}