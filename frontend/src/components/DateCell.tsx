// frontend/src/components/DateCell.tsx
import type { Appointment } from '../types';

interface DateCellProps {
  day: number;
  appointments: Appointment[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onClick: () => void;
}

const DateCell: React.FC<DateCellProps> = ({ day, appointments, isCurrentMonth, isToday, onClick }) => {
  // Filter and count appointments based on type and status
  const consultations = appointments.filter((apt) => apt.type === "consultation" && apt.status !== "rescheduled").length;
  const treatments = appointments.filter((apt) => apt.type === "treatment" && apt.status !== "rescheduled").length;
  const follow_up = appointments.filter((apt) => apt.type === "follow-up" && apt.status !== "rescheduled").length;
  
  // New: Count specifically for rescheduled types
  const rescheduledConsultations = appointments.filter((apt) => apt.type === "consultation" && apt.status === "rescheduled").length;
  const rescheduledTreatments = appointments.filter((apt) => apt.type === "treatment" && apt.status === "rescheduled").length;
  const rescheduledFollow_up = appointments.filter((apt) => apt.type === "follow-up" && apt.status === "rescheduled").length;

  return (
    <div
      className={`
        h-auto p-1 border rounded-lg cursor-pointer hover:shadow-md hover:border-primary transition-all
        ${!isCurrentMonth ? "bg-gray-50 text-gray-400" : isToday ? "bg-blue-200" : "bg-white"}
      `}
      onClick={onClick}
    >
      <div className="text-sm font-medium">{day}</div>

      <div className="flex gap-1 mt-1">
        {/* Non-rescheduled consultation count */}
        {consultations > 0 && (
          <div className="flex items-center justify-center w-5 h-5 text-xs text-white bg-blue-500 rounded-full">
            {consultations}
          </div>
        )}
        {/* Rescheduled consultation count */}
        {rescheduledConsultations > 0 && (
          <div className="flex items-center justify-center w-5 h-5 text-xs text-white bg-orange-500 rounded-full">
            {rescheduledConsultations}
          </div>
        )}
        {/* Non-rescheduled treatment count */}
        {treatments > 0 && (
          <div className="flex items-center justify-center w-5 h-5 text-xs text-white bg-green-500 rounded-full">
            {treatments}
          </div>
        )}
        {/* Rescheduled treatment count */}
        {rescheduledTreatments > 0 && (
          <div className="flex items-center justify-center w-5 h-5 text-xs text-white bg-orange-500 rounded-full">
            {rescheduledTreatments}
          </div>
        )}
        {/* Follow-up count (unchanged) */}
        {follow_up > 0 && (
          <div className="flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full">
            {follow_up}
          </div>
        )}
        {/* Rescheduled Follow-up count */}
        {rescheduledFollow_up > 0 && (
          <div className="flex items-center justify-center w-5 h-5 text-xs text-white bg-orange-500 rounded-full">
            {rescheduledFollow_up}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateCell;

