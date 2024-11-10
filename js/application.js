jQuery(document).ready(function () {
    // TODO DATETIME.NOW() TO DISCRIMINE WHICH DAY IS FIRST IN THE OBJECT!

    // HTML Items
    const search_button = $("#search_city");
    const my_location = $('#location');
    const section_show_weather = $('.show-section');

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
                    var first_forecast = weather_response.list[0].main.temp_min;
                    alert(`Primer aviso sobre temperatura mínima: ${first_forecast}`);
                    const city_name = weather_response.city.name;
                    alert(city_name);

                } else {
                    alert(`City ${city}, doesn't founded`);
                    section_show_weather.hide();
                }
            },
            error: function (xhr, status) {
                alert(`Something has gone wrong: ${status}`);
                section_show_weather.hide();
            },
            complete: function (xhr, status) {
                alert(`The status of the request is completed: ${status}.\The 'xhr': ${xhr}`);
            }
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
                                var first_forecast = weather_response.list[0].main.temp_min;
                                alert(`Primer aviso sobre temperatura mínima: ${first_forecast}`);
                                const city_name = weather_response.city.name
                                alert(city_name)
                            } else {
                                alert(`City ${city}, doesn't founded`);
                            }
                        },
                        error: function (xhr, status) {
                            alert(`Something has gone wrong: ${status}`);
                            section_show_weather.hide();
                        },
                        complete: function (xhr, status) {
                            alert(`The status of the request is completed: ${status}.\The 'xhr': ${xhr}`)
                        }
                    });
                    alert(`Tu ubicación es:\nLatitud: ${my_latitude}, Longitud: ${my_longitude}`);
                },
                function (error) {
                    alert(`Error trying to obtain the ubication: ${error.message}`);
                }
            );
        } else {
            alert('Geolocation not supported in this client/navegator');
        }

    });

    function dayOfWeek(timestampUnix = null) {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let dayName = null;
        if (timestampUnix == null) {
            dayName = daysOfWeek[new Date().getDay()];
        } else {
            // Miliseconds to Date()
            const date = new Date(timestampUnix * 1000);
            // Get day name
            dayName = daysOfWeek[date.getUTCDay()];
            dayName = (dayName != null) ? dayName : "Any day";
        }
        return dayName;
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
            weather_info = time_stamp_report["weather"][0];
            for (let key in weather_info) {
                if (keys_weather_icon.includes(key)) dict_own_weather[key] = weather_info[key];
            }
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
                <!-- Hora -->
                <div class="text-center mb-2">
                    <span class="fw-bold text-primary">${hour_forecasted}</span>
                </div>

                <!-- Descripción del tiempo -->
                <div class="text-center mb-2">
                    <span class="text-secondary">${time_forecast["main"]}</span>
                </div>
                <div class="text-center mb-2">
                    <img src="https://openweathermap.org/img/wn/${time_forecast["icon"]}@2x.png" alt="icono de tiempo" class="img-fluid" style="width: 40px; height: 40px;">
                </div>
                <div class="text-center mb-2">
                    <span>Pressure: ${time_forecast["pressure"]} hPa</span>
                </div>
                <div class="text-center mb-2">
                    <span>Temper: ${time_forecast["temp"]}ºC</span>
                </div>
                <div class="text-center mb-2">
                    <span>Temper_man: ${time_forecast["temp_max"]}ºC</span>
                </div>
                <div class="text-center">
                    <span>Temper_min: ${time_forecast["temp_min"]}ºC</span>
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

