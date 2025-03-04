/**
 * @function loadGoogleMapApi
 * @description Function to load the Google Maps & Places script
 */
export const loadGoogleMapApi = (apiKey: string, locale: string): HTMLScriptElement => {
    const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&region=${locale}&language=${locale}&libraries=places`
    const scripts = document.getElementsByTagName('script')

    for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src.indexOf(scriptUrl) === 0) {
            return scripts[i]
        }
    }

    const googleMapScript = document.createElement('script')

    googleMapScript.src = scriptUrl
    googleMapScript.async = true
    googleMapScript.defer = true
    window.document.body.appendChild(googleMapScript)

    return googleMapScript
}
