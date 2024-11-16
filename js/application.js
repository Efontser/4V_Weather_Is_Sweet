jQuery(document).ready(function () {
    // TODO DATETIME.NOW() TO DISCRIMINE WHICH DAY IS FIRST IN THE OBJECT!

    // HTML Items
    const search_button = $("#search_city");
    const my_location = $('#location');
    const section_show_weather = $('.show-section');
    const error = $("#city_not_founded");
    // Dict customized
    let dict_weather = {}

    // API Key
    const api_key = 'eba99215f58179a0b0969dfa0bf32f4d';

    search_button.on("click", function () {
        const city = $("#city_name").val();
        const weather_url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${api_key}&units=metric&lang=en`;
        $.ajax({
            url: weather_url,
            dataType: "json",
            method: 'GET',
            success: function (weather_response) {
                if (weather_response) {
                    dict_weather = build_my_dict(weather_response);
                    paintDayList();
                    section_show_weather.show();
                    error.hide();
                    // To scroll down to the Weather_list
                    $('html, body').animate({
                        scrollTop: $('#list_weather').offset().top
                    }, 800);
                } else {
                    error.text(`City ${city} doesn't founded.`);
                    error.show();
                }
            },
            error: function (xhr, status) {
                error.text(`There was an error. City doesn´t founded: ${xhr}`);
                error.show();
                section_show_weather.hide();
            },
        });
    });



    // Actual location. 
    my_location.on('click', function (event) {
        // Prevent the load of the page
        event.preventDefault();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    const my_latitude = position.coords.latitude;
                    const my_longitude = position.coords.longitude;
                    const location_url = `https://api.openweathermap.org/data/2.5/forecast?lat=${my_latitude}&lon=${my_longitude}&appid=${api_key}&units=metric&lang=es`;
                    $.ajax({
                        url: location_url,
                        dataType: "json",
                        method: 'GET',
                        success: function (weather_response) {
                            if (weather_response) {
                                dict_weather = build_my_dict(weather_response);
                                paintDayList();
                                section_show_weather.show();
                                error.hide();
                                // Scroll down smothly
                                $('html, body').animate({
                                    scrollTop: $('#list_weather').offset().top
                                }, 800);
                            } else {
                                error.text(`City ${city} doesn't founded.`);
                                error.show();
                            }
                        },
                        error: function (xhr, status) {
                            error.text(`There was an error. City doesn´t founded: ${xhr}`);
                            error.show();
                            section_show_weather.hide();
                        },
                    });
                },
                function (error) {
                    alert(`Error trying to obtain the ubication: ${error.message}`);
                }
            );
        } else {
            alert('Geolocation not supported in this client/navegator');
        }
    });


    // Listener that changes the Active class, and also calls paintWeather() with the parameter day_choosed.
    $("#day_list").on("click", ".days", function() {
        $(".days").removeClass('active');
        $(this).addClass('active');
        let day_choosed = $(this).text();
        paintWeather(day_choosed);
    });
   
    
    

    /**
     * Function called: 
     *      1-In order to paint the week day list.
     *      2-Obtain the actual day. That's needed because the dictionarys are a disorded collection.
     * @param {*} timestampUnix default == Null
     * @returns day of Week
     */
    function dayOfWeek(timestampUnix = null) {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let day_name = null;
        if (timestampUnix == null) {
            let actual_hour = new Date().getHours();
            let actual_day = daysOfWeek[new Date().getDay()];
            //Operator ternary --> First we have to consider the worst case scenary: 1- 'Saturday past 21:00'
            //                     Then                                              2- 'Anyday past 21:00'
            //                     Finally/else                                      3- Base case
            day_name = (actual_day == daysOfWeek[daysOfWeek.length -1] && actual_hour >= 21)? daysOfWeek[0] : (actual_hour >= 21)? daysOfWeek[(new Date().getDay()) + 1] : actual_day;
        } else {
            // Miliseconds to Date()
            const date = new Date(timestampUnix * 1000);
            // Get day name
            day_name = daysOfWeek[date.getUTCDay()];
            day_name = (day_name != null) ? day_name : "Any day";
        }
        return day_name;
    }

    // Function that uses the Data Json, and tries to customice a dictionary in order to paint it in the HTML.
    // Returns --> The dictionary customiced, so it may be assigned to a global variable.
    function build_my_dict(weather) {
        let dict_weather_aux = {}
        for (let time_stamp_report of weather["list"]) {
            let dict_own_weather = {};
            let keys_atmospheric_factors = ["temp", "temp_min", "temp_max", "pressure", "humidity"];
            let main = time_stamp_report["main"];
            for (let key in main) {
                if (keys_atmospheric_factors.includes(key)) dict_own_weather[key] = main[key];
            }
            let keys_weather_icon = ["main", "icon"];
            // For an unknown reason, we must iterate over a dict with a list with only one element...
            let weather_info = time_stamp_report["weather"][0];
            for (let key in weather_info) {
                if (keys_weather_icon.includes(key)) dict_own_weather[key] = weather_info[key];
            }
            let weather_wind = time_stamp_report["wind"];
            dict_own_weather["wind_speed"] = weather_wind["speed"];
            dict_own_weather["dt_txt"] = time_stamp_report["dt_txt"];


            // Get the weekDay. And create a pair key[my_day] : [empty]. Wheter is Monday, Tuesday... So we don't override the data while saving the value on the object.
            let my_day = dayOfWeek(time_stamp_report["dt"]);
            if (!dict_weather_aux[my_day]) {
                dict_weather_aux[my_day] = [];
            }
            // There's no day yet. So we 'save' the KEY too.
            dict_weather_aux[my_day].push(dict_own_weather);

        }
        return dict_weather_aux;
    }

    function paintWeather(dayName = null) {
        if (dayName == null) {
            dayName = dayOfWeek();
        }
        const list_weather = $("#list_weather");
        list_weather.empty();
        for (let time_forecast of dict_weather[dayName]) {
            let hour_forecasted = time_forecast["dt_txt"].split(" ")[1].slice(0, 5);
            let forecast = `<li class="list-group-item d-flex flex-column align-items-center justify-content-between mb-3 p-4">
                <div class="text-center mb-2">
                    <span class="fw-bold text-primary">${hour_forecasted}</span>
                </div>
                <hr>
                <div class="text-center mb-2">
                    <span class="text-secondary">${time_forecast["main"]}</span>
                </div>
                <div class="text-center mb-2">
                    <img src="https://openweathermap.org/img/wn/${time_forecast["icon"]}@2x.png" alt="icon weather" class="img-fluid" style="width: 40px; height: 40px;">
                </div>
                <div class="text-center mb-2">
                    <span>Pressure: ${time_forecast["pressure"]} hPa</span>
                </div>
                <div class="text-center mb-2">
                    <span>Tª: ${Math.round(time_forecast["temp"])}ºC</span>
                </div>
                <div class="text-center mb-2">
                    <span>Humidity: ${time_forecast["humidity"]}%</span>
                </div>
                <div class="text-center mb-2">
                    <span>Tª_max: ${Math.round(time_forecast["temp_max"])}ºC</span>
                </div>
                <div class="text-center mb-2">
                    <span>Tª_min: ${Math.round(time_forecast["temp_min"])}ºC</span>
                </div>
                <div class="text-center mb-2">
                    <span>Wind speed: ${time_forecast["wind_speed"]}km/h</span>
                </div>
                </li>`;
            list_weather.append(forecast);
        }
    }


    function paintDayList() {
        const day_list = $("#day_list");
        day_list.empty();
        if (dict_weather) {
            let first_day = true;
            for (let key of Object.keys(dict_weather)) {
                let btnDay = `<li class="nav-item">
                <button class="nav-link days ${first_day ? 'active' : ''}" aria-current="page">${key}</button>
              </li>`;
                day_list.append(btnDay);
                first_day = false;
            }
            paintWeather();
        }
    }
});

