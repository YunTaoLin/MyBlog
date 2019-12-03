function trans_time(time) {
    year = String(time.getFullYear())
    month = String(time.getMonth() < 9 ? '0' + parseInt(time.getMonth()) + 1 : parseInt(time.getMonth()) + 1)
    date = String(time.getDate() < 10 ? '0' + time.getDate() : time.getDate())
    hours = String(time.getHours() < 10 ? '0' + time.getHours() : time.getHours())
    minutes = String(time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes())
    return year + '/' + month + '/' + date + '  ' + hours + ':' + minutes
}
module.exports = trans_time