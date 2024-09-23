import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateDayTimes(skip: number = 0): string[] {
  const times: string[] = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += skip) {
      const formattedHour = hour.toString().padStart(2, "0");
      const formattedMinute = minute.toString().padStart(2, "0");
      times.push(`${formattedHour}:${formattedMinute}`);
    }
  }

  return times;
}

export function generateTimeIntervals(
  skip: number,
  start: string,
  end: string,
  spliter: string = "."
): string[] {
  const result: string[] = [];

  // Helper function to convert "HH:mm" to total minutes
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(spliter).map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to convert total minutes back to "HH:mm"
  const minutesToTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Convert start and end times to total minutes
  let startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  // Generate times in the interval
  while (startMinutes <= endMinutes) {
    result.push(minutesToTime(startMinutes));
    startMinutes += skip; // Increment by skip value in minutes
  }

  return result;
}

export function isValidTimeRange(start: string, end: string): boolean {
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  return timeToMinutes(start) <= timeToMinutes(end);
}

export function toISODateTime(time: string): string {
  const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
  return `${today}T${time}:00.000Z`; // Combine date with the time and append seconds and milliseconds
}
