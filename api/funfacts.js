const ICS_LINK = "https://calendar.google.com/https://calendar.google.com/calendar/ical/c_8da90cdf9cf1b07e9815d4bba4e4b1f7fd75249e5cbfe10266d292d5fac6d484%40group.calendar.google.com/public/basic.ics/ical/c_8da90cdf9cf1b07e9815d4bba4e4b1f7fd75249e5cbfe10266d292d5fac6d484%40group.calendar.google.com/public/basic.ics";

function parseICS(data) {
  const lines = data.split("\n");
  const events = [];
  let current = null;

  for (let line of lines) {
    line = line.trim();
    if (line === "BEGIN:VEVENT") current = {};
    if (!current) continue;

    if (line.startsWith("SUMMARY:")) current.title = line.replace("SUMMARY:", "");
    if (line.startsWith("DTSTART")) current.date = line.split(":")[1];
    if (line.startsWith("DESCRIPTION:")) current.description = line.replace("DESCRIPTION:", "");
    if (line === "END:VEVENT" && current) {
      // Convert to ISO string for JSON
      current.dateObj = new Date(
        parseInt(current.date.substring(0, 4)),
        parseInt(current.date.substring(4, 6)) - 1,
        parseInt(current.date.substring(6, 8))
      ).toISOString();
      events.push(current);
      current = null;
    }
  }

  return events;
}

export default async function handler(req, res) {
  try {
    const response = await fetch(ICS_LINK);
    if (!response.ok) throw new Error("Failed to fetch ICS file");

    const text = await response.text();
    const events = parseICS(text);

    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load events" });
  }
}
