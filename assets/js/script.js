const savedList = $('.list-group');
const mainWeather = $('#main-weather');
const forecast = $('#5-day-forecast');

const inputField = $('#input');
const searchBtn = $('#search-button');

searchBtn.on('click', function () {
    let cityName = inputField.val();

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
                .then((data) =>{
                    if (!data) {
                        throw Error(data);
                    }

                    console.log(data);

                })
                .catch(function (error){
                    console.log(error);
                })

            })
            .catch(function (error){
                console.log(error);
            })
        })
        .catch(function (error){
            console.log(error);
        })

        
})

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

    let F = String.fromCharCode(176);
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