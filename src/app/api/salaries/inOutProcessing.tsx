function timeToDelta(timeStr: string): number {
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds; // total seconds
}

function transFormToString(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${minutes}:${seconds}`;
}

export function handleData(records: { ID: string; Datetime: string }[]) {
  const groupedRecords = groupBy(records, "ID");

  Object.keys(groupedRecords).forEach((ID) => {
    const data = groupedRecords[ID];
    const sortedData = data.sort(
      (a, b) => new Date(a.Datetime).getTime() - new Date(b.Datetime).getTime()
    );

    const dateGroup = groupBy(
      sortedData,
      (record) => new Date(record.Datetime).toISOString().split("T")[0]
    );

    const attendedDays = Object.keys(dateGroup).map((date) => {
      const dayRecords = dateGroup[date];
      const startTimes = dayRecords.map(
        (record) => record.Datetime.split("T")[1]
      );
      const endTimes = dayRecords.map(
        (record) => record.Datetime.split("T")[1]
      );

      const startPerDay = timeToDelta(startTimes[0]);
      const endPerDay = timeToDelta(endTimes[endTimes.length - 1]);

      const deltaPerDay = transFormToString(endPerDay - startPerDay);
      const formattedDate = new Date(date).toLocaleDateString("en-GB"); // Format as DD/MM/YYYY

      return deltaPerDay === "0:0:0"
        ? `${formattedDate}\tNo Logout for this day`
        : `${formattedDate}\t${deltaPerDay}`;
    });

    // Log the results to the console
    console.log(`Attendance of ID-${ID}`);
    console.log("Date\tDuration");
    attendedDays.forEach((day) => console.log(day));
  });
}

function groupBy<T>(array: T[], key: keyof T | ((item: T) => any)) {
  return array.reduce((result, item) => {
    const groupKey = typeof key === "function" ? key(item) : item[key];
    (result[groupKey] = result[groupKey] || []).push(item);
    return result;
  }, {} as { [key: string]: T[] });
}

// Process the hardcoded data
