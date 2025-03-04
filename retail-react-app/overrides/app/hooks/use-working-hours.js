import moment from 'moment'

export const useWorkingHours = () => {
    function getWorkingHours(data, dayValue, hourValue) {
        let timeCheck, workingHours, noData

        data.forEach((time) => {
            if (time.title == dayValue) {
                let timeBegin, timeEnd

                if (time.amBegin && !time.amEnd) {
                    timeBegin = time.amBegin
                    timeEnd = time.pmEnd

                    if (
                        moment(hourValue, 'hh:mm:ss').isBetween(
                            moment(time.amBegin, 'hh:mm:ss'),
                            moment(time.pmEnd, 'hh:mm:ss')
                        )
                    ) {
                        timeCheck = true
                    }
                } else if (!time.amBegin && time.pmBegin) {
                    timeBegin = time.pmBegin
                    timeEnd = time.pmEnd

                    if (
                        moment(hourValue, 'hh:mm:ss').isBetween(
                            moment(time.pmBegin, 'hh:mm:ss'),
                            moment(time.pmEnd, 'hh:mm:ss')
                        )
                    ) {
                        timeCheck = true
                    }
                } else if (time.amBegin && !time.pmBegin) {
                    timeBegin = time.amBegin
                    timeEnd = time.amEnd

                    if (
                        moment(hourValue, 'hh:mm:ss').isBetween(
                            moment(time.amBegin, 'hh:mm:ss'),
                            moment(time.amEnd, 'hh:mm:ss')
                        )
                    ) {
                        timeCheck = true
                    }
                } else if (time.amBegin && time.amEnd && time.pmBegin && time.pmEnd) {
                    timeBegin = time.amBegin
                    timeEnd = time.pmEnd

                    if (
                        moment(hourValue, 'hh:mm:ss').isBetween(
                            moment(time.amBegin, 'hh:mm:ss'),
                            moment(time.amEnd, 'hh:mm:ss')
                        ) ||
                        moment(hourValue, 'hh:mm:ss').isBetween(
                            moment(time.pmBegin, 'hh:mm:ss'),
                            moment(time.pmEnd, 'hh:mm:ss')
                        )
                    ) {
                        timeCheck = true
                    }
                } else {
                    noData = true
                }

                if ((time.amBegin && time.pmEnd) || (time.pmBegin && time.pmEnd) || (time.amBegin && time.amEnd)) {
                    workingHours =
                        timeBegin?.split(':')[0] +
                        'h' +
                        timeBegin?.split(':')[1] +
                        ' à ' +
                        timeEnd?.split(':')[0] +
                        'h' +
                        timeEnd?.split(':')[1]
                }
            }
        })

        return {timeCheck, workingHours, noData}
    }
    return {getWorkingHours}
}
