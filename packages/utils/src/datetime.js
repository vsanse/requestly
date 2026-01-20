/**
 * Date and Time Utilities
 *
 * Pure utility functions for date/time formatting, manipulation,
 * and calculations. Platform-agnostic.
 *
 * Note: For advanced date operations, consider using libraries like dayjs or date-fns
 * For now, we keep dependencies minimal and use native Date API
 */

/**
 * Convert timestamp to date string in DD/MM/YYYY format
 * @param {number} timestamp - Timestamp in milliseconds
 * @returns {string|null} Formatted date string or null if invalid
 */
export const dateStringFromTimestamp = (timestamp) => {
  if (!timestamp || typeof timestamp !== 'number') return null;

  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  if (isNaN(day)) return null;

  const fullDate = day + "/" + (month + 1) + "/" + year;
  return fullDate;
};

/**
 * Standardize any date to YYYY-MM-DD format
 * @param {string|number|Date} date - Date in any format (epoch, ISO string, Date object)
 * @returns {string} Date in YYYY-MM-DD format
 */
export const standardizeDateFormat = (date) => {
  let dateObj;
  if (!date) {
    dateObj = new Date();
  } else {
    dateObj = new Date(date);
  }
  return dateObjToDateString(dateObj);
};

/**
 * Convert Date object to YYYY-MM-DD string
 * @param {Date} dateObj - Date object
 * @returns {string} Date in YYYY-MM-DD format
 */
export const dateObjToDateString = (dateObj) => {
  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    return new Date().toISOString().split("T")[0];
  }
  return dateObj.toISOString().split("T")[0];
};

/**
 * Get the oldest date from an array of dates
 * @param {Array<string|number|Date>} arrayOfDates - Array of dates in any format
 * @returns {string|null} Oldest date in YYYY-MM-DD format
 */
export const getOldestDate = (arrayOfDates = []) => {
  if (!Array.isArray(arrayOfDates) || arrayOfDates.length === 0) return null;

  // Get all dates in "YYYY-MM-DD" format
  const datesArray = arrayOfDates
    .filter(date => date != null)
    .map((date) => standardizeDateFormat(date));

  if (datesArray.length === 0) return null;

  // Create a sorted array of dates
  const sortedDatesArr = datesArray.sort();
  // Return the oldest
  return sortedDatesArr[0];
};

/**
 * Calculate days between two dates
 * @param {string|number|Date} startDate - Start date
 * @param {string|number|Date} endDate - End date
 * @returns {number} Number of days between dates
 */
export const getDaysCount = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end)) return 0;

  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Get time difference from timestamp in milliseconds
 * @param {number} timestamp - Past timestamp
 * @returns {number} Difference between now and timestamp in milliseconds
 */
export const getTimeDifferenceFromTimestampInMs = (timestamp) => {
  if (!timestamp || typeof timestamp !== 'number') return 0;
  return Date.now() - timestamp;
};

/**
 * Get time difference between two timestamps
 * @param {number} time1 - First timestamp (epoch)
 * @param {number} time2 - Second timestamp (epoch)
 * @returns {number} Difference in milliseconds
 */
export const getTimeDifferenceFromTimestamps = (time1, time2) => {
  const time1DateObj = new Date(time1);
  const time2DateObj = new Date(time2);

  if (isNaN(time1DateObj) || isNaN(time2DateObj)) return 0;

  return time1DateObj.getTime() - time2DateObj.getTime();
};

/**
 * Convert epoch timestamp to locale time string
 * @param {number} epoch - Timestamp in milliseconds
 * @returns {string} Time string in locale format
 */
export const epochToLocaleTime = (epoch) => {
  if (!epoch || typeof epoch !== 'number') return '';
  const myDate = new Date(epoch);
  return myDate.toLocaleTimeString("en-CA");
};

/**
 * Convert epoch timestamp to locale date string
 * @param {number} epoch - Timestamp in milliseconds
 * @returns {string} Date string in locale format
 */
export const epochToLocaleDate = (epoch) => {
  if (!epoch || typeof epoch !== 'number') return '';
  const myDate = new Date(epoch);
  return myDate.toLocaleDateString("en-CA");
};

/**
 * Convert epoch timestamp to date string
 * @param {number} epoch - Timestamp in milliseconds
 * @returns {string} Date string
 */
export const epochToDate = (epoch) => {
  if (!epoch || typeof epoch !== 'number') return '';
  const myDate = new Date(epoch);
  return myDate.toDateString();
};

/**
 * Get date string from Date object
 * @param {Date} dateObj - Date object
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const getDateString = (dateObj) => {
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return '';
  return dateObj.toLocaleDateString("en-CA");
};

/**
 * Get long format date string (e.g., "Jan 20, 2026")
 * @param {Date} dateObj - Date object
 * @returns {string} Long format date string
 */
export const getLongFormatDateString = (dateObj) => {
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return '';
  return dateObj.toLocaleString("default", { month: "short", day: "numeric", year: "numeric" });
};

/**
 * Get current timestamp
 * @returns {number} Current timestamp in milliseconds
 */
export const getCurrentTimeStamp = () => {
  return Date.now();
};

/**
 * Generate object creation date (timestamp)
 * @returns {number} Current timestamp in milliseconds
 */
export const generateObjectCreationDate = () => {
  return getCurrentTimeStamp();
};

/**
 * Convert milliseconds to MM:SS format
 * @param {number} ms - Milliseconds
 * @returns {string} Time in MM:SS format
 */
export const msToMinutesAndSeconds = (ms) => {
  if (typeof ms !== 'number' || ms < 0) return '00:00';

  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  const addPadding = (t) => (t < 10 ? "0" : "") + t;

  return addPadding(minutes) + ":" + addPadding(seconds);
};

/**
 * Convert seconds to MM:SS format
 * @param {number} sec - Seconds
 * @returns {string} Time in MM:SS format
 */
export const secToMinutesAndSeconds = (sec) => {
  if (typeof sec !== 'number' || sec < 0) return '00:00';

  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  const addPadding = (t) => (t < 10 ? "0" : "") + t;

  return addPadding(minutes) + ":" + addPadding(seconds);
};

/**
 * Convert milliseconds to HH:MM:SS format
 * @param {number} millis - Milliseconds
 * @returns {string} Time in HH:MM:SS format
 */
export const msToHoursMinutesAndSeconds = (millis) => {
  if (typeof millis !== 'number' || millis < 0) return '00:00:00';

  try {
    const match = new Date(millis).toUTCString().match(/(\d\d:\d\d:\d\d)/);
    return match ? match[0] : '00:00:00';
  } catch {
    return '00:00:00';
  }
};

/**
 * Get formatted timestamp in "DD MMM YYYY - H:MMAM/PM" format
 * Example: "24 Aug 2023 - 5:24PM"
 * @param {number} timestamp - Timestamp in milliseconds
 * @returns {string} Formatted timestamp string
 */
export const getFormattedTimestamp = (timestamp) => {
  if (!timestamp || typeof timestamp !== 'number') return '';

  const date = new Date(timestamp);
  if (isNaN(date)) return '';

  const day = date.getDate();
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
  const year = date.getFullYear();

  const hours = date.getHours() % 12 || 12;
  const ampm = date.getHours() >= 12 ? "PM" : "AM";
  const minutes = date.getMinutes();

  return `${day} ${month} ${year} - ${hours}:${minutes < 10 ? "0" : ""}${minutes}${ampm}`;
};

/**
 * Add days to a date
 * @param {Date|string|number} date - Date to add days to
 * @param {number} days - Number of days to add
 * @returns {Date} New date with added days
 */
export const addDaysToDate = (date, days) => {
  const dateObj = new Date(date);
  if (isNaN(dateObj) || typeof days !== 'number') return new Date();

  const result = new Date(dateObj);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Check if today's date is within a range from signup date + days
 * @param {string|number|Date} signupDate - User signup date
 * @param {number} numDaysToAdd - Number of days to add to signup date
 * @returns {boolean} True if today is within the range
 */
export const getDateAfterAddingSomeDaysInUserSignupDate = (signupDate, numDaysToAdd) => {
  if (!signupDate || typeof numDaysToAdd !== 'number') return false;

  const signup = new Date(signupDate);
  if (isNaN(signup)) return false;

  const targetDate = addDaysToDate(signup, numDaysToAdd);
  return Date.now() <= targetDate.getTime();
};

/**
 * Format date using custom format string
 * Uses native Date formatting - for complex formats, consider using a library like dayjs
 * @param {string} format - Format string (e.g., "DD-MM-YYYY", "YYYY/MM/DD")
 * @param {number|Date|string} timestamp - Date to format
 * @returns {string} Formatted date string
 */
export const getFormattedDate = (format = "DD-MM-YYYY", timestamp = new Date()) => {
  const date = new Date(timestamp);
  if (isNaN(date)) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  // Simple format replacements
  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year)
    .replace('YY', String(year).slice(-2));
};

/**
 * Convert epoch to date and time string in DD-MMM-YYYY HH:mm:ss format
 * Example: "20-Jan-2026 15:30:45"
 * @param {number} timestamp - Timestamp in milliseconds
 * @returns {string} Formatted date and time string
 */
export const epochToDateAndTimeString = (timestamp) => {
  if (!timestamp || typeof timestamp !== 'number') return '';

  const date = new Date(timestamp);
  if (isNaN(date)) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Convert stringified MM:SS timestamp to total seconds
 * @param {string} timestamp - Time in MM:SS format
 * @returns {number} Total seconds
 */
export const getSecondsFromStringifiedMinSec = (timestamp) => {
  if (!timestamp || typeof timestamp !== 'string') return 0;

  const parts = timestamp.split(':');
  const minutes = parts[0] || '0';
  const seconds = parts[1] || '0';
  const parsedMinutes = parseInt(minutes, 10);
  const parsedSeconds = parseInt(seconds.substring(0, 2), 10);

  return (isNaN(parsedMinutes) ? 0 : parsedMinutes) * 60 + (isNaN(parsedSeconds) ? 0 : parsedSeconds);
};

/**
 * Get days difference between timestamp and now
 * @param {number|string|Date} timestamp - Past timestamp
 * @returns {number} Number of days between timestamp and now
 */
export const getDaysDifference = (timestamp) => {
  const now = new Date();
  const lastSeen = new Date(timestamp);

  if (isNaN(lastSeen)) return 0;

  const diffTime = Math.abs(now.getTime() - lastSeen.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
