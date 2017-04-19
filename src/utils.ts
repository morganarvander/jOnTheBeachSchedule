export const parseTimeInterval = (timeStr) => {
  return parseTime(timeStr.split("-")[0]);
}

export const parseTime = (timeStr: string) => {
  var d = new Date();
  var time = timeStr.match(/(\d+)(?::(\d\d))?\s*(p?)/);
  d.setHours(parseInt(time[1]) + (time[3] ? 12 : 0));
  d.setMinutes(parseInt(time[2]) || 0);
  return d;
}