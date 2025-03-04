
/**
* Creates and appends the OneTrust scripts to the DOM
* @param {Object} opts - Options object containing the script IDs
* @param {string} opts.ikksOneTrustID - The OneTrust script ID for IKKS
* @param {string} opts.icodeOneTrustID - The OneTrust script ID for ICODE
* @param {boolean} opts.isIKKS - Flag to determine which script ID to use
* @returns {Object} - An object containing the script elements
*/
const oneTrust = (opts) => {
    // If the options are not provided, return null
    if (!opts || !opts.ikksOneTrustID || !opts.icodeOneTrustID || !!document.getElementById("ot-sdk")) {
        return null
    }

    const scriptID = opts.isIKKS ? opts.ikksOneTrustID : opts.icodeOneTrustID

    const consentScript = `https://cdn.cookielaw.org/consent/${scriptID}/OtAutoBlock.js`
    const sdkScript = `https://cdn.cookielaw.org/scripttemplates/otSDKStub.js`

    const sdk = document.createElement("script");
    sdk.id = "ot-sdk"
    sdk.setAttribute("crossorigin", "anonymous");
    sdk.setAttribute("type", "text/javascript");
    sdk.setAttribute("src", sdkScript);
    sdk.setAttribute("data-document-language", "true");
    sdk.setAttribute("data-domain-script", scriptID);

    const consent = document.createElement("script");
    consent.setAttribute("crossorigin", "anonymous");
    consent.setAttribute("type", "text/javascript");
    consent.setAttribute("charset", "UTF-8");
    consent.setAttribute("src", consentScript);

    const otInline = document.createElement("script");
    otInline.setAttribute("type", "text/javascript");
    otInline.innerHTML = `function OptanonWrapper() { }`;


    document.body.appendChild(consent);
    document.body.appendChild(sdk);
    document.body.appendChild(otInline);

    return {
        sdk,
        consent,
        otInline
    }
}; 

export default oneTrust
