export const MESSAGES = {
  success: {
    appointmentBooked: (doctorName: string, date: string, time: string) => 
      `Appointment confirmed for Dr. ${doctorName} on ${date}, ${time}.`,
  },
  empty: {
    appointments: "No appointments today. Enjoy the quiet, or book the next one.",
  },
  error: {
    saveFailed: "We couldn't save this record. Your changes are still here. Please try again.",
  },
  warning: {
    lowBeds: (count: number, type: string = 'ICU') => 
      `Only ${count} ${type} beds are free right now.`,
  },
  info: {
    noShow: (patientName: string, time: string) =>
      `${patientName} didn't arrive for the ${time} slot. You can reschedule from here.`
  }
};
