exports.dateFormat = (date) => {
  if (!(date instanceof Date)) {
    date = new Date();
  }

  if (date instanceof Date) {
    const dateObj = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      date: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    };
    for (let prop in dateObj) {
      if (dateObj[prop] < 10) {
        dateObj[prop] = '0' + dateObj[prop];
      }
    }
    return dateObj.year + '-' + dateObj.month + '-' + dateObj.date + ' ' +
           dateObj.hour + ':' + dateObj.minute + ':' + dateObj.second;
  }
  return '';
}
