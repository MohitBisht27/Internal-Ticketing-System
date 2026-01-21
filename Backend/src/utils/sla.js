export const SLA_HOURS = Object.freeze({
  low: 72,
  medium: 48,
  high: 24,
  critical: 4,
});

export const calculateDeadline = (priority = "medium") => {
  const hours = SLA_HOURS[priority] ?? SLA_HOURS.medium;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};
