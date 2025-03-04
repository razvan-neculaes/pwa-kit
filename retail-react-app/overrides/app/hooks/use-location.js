export const useLocation = () => {
    const calculateLocation = (value) => {
        let location
        let locationText1, locationText2, locationText3, locationText4

        locationText1 = value.split(' ')
        locationText2 = locationText1[locationText1.length - 2]

        if (locationText2.includes('/')) {
            locationText3 = locationText2.split('/')
            locationText4 = locationText3[locationText3.length - 1]
        } else {
            locationText4 = locationText2
        }
        location = locationText4.replace(',', '')
        return location
    }

    function getAccurateLocation(results) {
        let location
        if (results[0]) {
            if (results[0].plus_code && results[0].plus_code.compound_code) {
                location = calculateLocation(results[0].plus_code.compound_code)
            } else if (results[0].formatted_address) {
                location = calculateLocation(results[0].formatted_address)
            } else {
                //find country name
                for (var i = 0; i < results[0].address_components.length; i++) {
                    for (var b = 0; b < results[0].address_components[i].types.length; b++) {
                        //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                        if (
                            results[0].address_components[i].types[b] ==
                            'administrative_area_level_1'
                        ) {
                            //this is the object you are looking for
                            location = results[0].address_components[i].long_name
                            break
                        }
                    }
                }
            }
        }
        location = location ? location.split(' ').join('-') : null
        return location
    }
    return {getAccurateLocation}
}
