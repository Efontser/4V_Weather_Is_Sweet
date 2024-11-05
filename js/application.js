jQuery(document).ready(function () {
    const search_button = $("#search_city");
    const api_key = 'eba99215f58179a0b0969dfa0bf32f4d';
    const my_location = $('#location');


    search_button.on("click", function () {
        const city = $("#city_name").val();
        const weather_url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${api_key}&units=metric&lang=es`;
        $.ajax({
            url: weather_url,
            dataType: "json",
            method: 'GET',
            success: function (weather_response) {
                if (weather_response) {
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
                                var first_forecast = weather_response.list[0].main.temp_min;
                                alert(`Primer aviso sobre temperatura mínima: ${first_forecast}`);
                                const city_name = weather_response.city.name
                                alert(city_name)
                            } else {
                                alert(`City ${city}, doesn't founded`);
                            }
                        },
                        error: function (xhr, status) {
                            alert(`Something has gone wrong: ${status}`)
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



});