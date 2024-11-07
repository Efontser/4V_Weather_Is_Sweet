jQuery(document).ready(function () {
    // HTML Items
    const search_button = $("#search_city");
    const my_location = $('#location');
    const section_show_weather = $('.show-section');
    const day_list = $("#day_list");

    // Dict customized
    let dict_weather = {} 

    // API Key
    const api_key = 'eba99215f58179a0b0969dfa0bf32f4d';

    search_button.on("click", function () {
        const city = $("#city_name").val();
        const weather_url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${api_key}&units=metric&lang=es`;
        $.ajax({
            url: weather_url,
            dataType: "json",
            method: 'GET',
            success: function (weather_response) {
                if (weather_response) {
                    dict_weather = build_my_dict(weather_response);
                    section_show_weather.show();
                    var first_forecast = weather_response.list[0].main.temp_min;
                    alert(`Primer aviso sobre temperatura mínima: ${first_forecast}`);
                    const city_name = weather_response.city.name;
                    alert(city_name);
                    
                } else {
                    alert(`City ${city}, doesn't founded`);
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
                function(error){
                    alert(`Error trying to obtain the ubication: ${error.message}`);
                }
            );
        } else {
            alert('Geolocation not supported in this client/navegator');
        }

    });

    function dayOfWeek(timestampUnix){
        let dayName = null;
        if (timestampUnix){
            // Miliseconds to Date()
            const date = new Date(timestampUnix * 1000);
            // Get day name
            const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            dayName = daysOfWeek[date.getUTCDay()]; 
        }
        dayName = (dayName != null) ? dayName : "Any day";
        return dayName;
    }

    // Function that uses the Data Json, and tries to customice a dictionary in order to paint it in the HTML.
    // Returns --> The dictionary customiced, so it may be assigned to a global variable.
    function build_my_dict(weather){
       let dict_weather_aux = {}
        for (let time_stamp_report of weather["list"]){
            let dict_own_weather = {};
            let keys_atmospheric_factors = ["temp", "temp_min", "temp_max", "pressure", "humidity"];
            let main = time_stamp_report["main"];
            for (let key in main){
                if (keys_atmospheric_factors.includes(key)) dict_own_weather[key] = main[key];
            }
            let keys_weather_icon = ["main", "icon"];
            // For an unknown reason, we must iterate over a dict with a list with only one element...
            weather_info = time_stamp_report["weather"][0];
            for (let key in weather_info){
                if (keys_weather_icon.includes(key)) dict_own_weather[key] = weather_info[key];
            }
            dict_own_weather["dt_txt"] = time_stamp_report["dt_txt"];

            // Get the weekDay. Wheter is Monday, Tuesday... So we don't override the data.
            let my_day = dayOfWeek(time_stamp_report["dt"]);
            if (dict_weather_aux[my_day]){
                dict_weather_aux[my_day].push(dict_own_weather);
            }else {
                // There's no day yet. So we 'save' the KEY too.
                dict_weather_aux[my_day] = dict_own_weather;
            }
        }
        return dict_weather_aux;
    }
});

