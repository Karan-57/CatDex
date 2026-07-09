export function todayString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDateForDisplay(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const monthIndex = parseInt(month, 10) - 1;
  const dayNum = parseInt(day, 10);
  return `${monthNames[monthIndex]} ${dayNum}, ${year}`;
}