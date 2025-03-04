const timeZoneValue = {
    IS: 0,
    CY: 2,
    GR: 2,
    SA: 3,
    IT: 1,
    ES: 1,
    BG: 2,
    FR: 1,
    KW: 3,
    CR: -6,
    MC: 1,
    BH: 3,
    AT: 1,
    GE: 4,
    DE: 1,
    CH: 1,
    AD: 1,
    CZ: 1,
    AE: 4,
    LU: 1,
    BE: 1,
    NL: 1,
    PT: 0,
    SE: 1,
    GB: 0,
    IR: 3.5,
    IE: 0,
    NO: 1,
    SN: 0,
    RE: 4,
    TH: 7,
    CN: 8,
    US: -5,
    CA: -5,
    MQ: -4,
    GP: -4,
    SX: -4,
    SG: 8,
    SK: 1,
    TW: 8,
    JP: 9,
    MX: -6
}

const isDstObserved = (today) => {
    const timeZoneName = today.toLocaleTimeString('en-US', {
        timeZone: 'Europe/Paris',
        timeZoneName: 'short',
    })

    return Number(timeZoneName.substring(timeZoneName.indexOf('+') + 1)) !== 1
}

export const useTimezone = () => {
    function getUTCOffset(countryCode) {
        const today = new Date()
        const summerTimeAdd = isDstObserved(today) ? 1 : 0

        return (timeZoneValue[countryCode] ? timeZoneValue[countryCode] : 1) + summerTimeAdd
    }

    return {getUTCOffset}
}
