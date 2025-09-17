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
  const maintenance = appointments.filter((apt) => apt.type === "maintenance" && apt.status !== "rescheduled").length;

  
  // New: Count specifically for rescheduled types
  const rescheduledConsultations = appointments.filter((apt) => apt.type === "consultation" && apt.status === "rescheduled").length;
  const rescheduledTreatments = appointments.filter((apt) => apt.type === "treatment" && apt.status === "rescheduled").length;
  const rescheduledMaintenance = appointments.filter((apt) => apt.type === "maintenance" && apt.status === "rescheduled").length;

  return (
    <div
      className={`flex justify-center md:justify-between w-13 md:w-40 h-40 md:h-40 px-1 md:px-2
        h-auto p-1 border md:rounded-lg cursor-pointer hover:shadow-md hover:border-primary transition-all
        ${!isCurrentMonth ? "bg-gray-50 text-gray-400" : isToday ? "bg-gray-200" : "bg-white"}
      `}
      onClick={onClick}
    >
      {/* <div className="text-lg md:text-sm font-medium">{day}</div> */}
      <div className={`text-lg md:text-sm font-medium px-2 rounded-full 
        ${consultations && 'border-2 border-blue-400'} 
        ${treatments && 'border-2 border-green-400'} 
        ${maintenance && 'border-2 border-red-400'}
        ${(rescheduledConsultations > 0 || rescheduledTreatments > 0  || rescheduledMaintenance > 0) && 'border-2 border-orange-500'}
        md:border-0`}>{day}</div> 

      <div className="hidden md:flex gap-1 mt-1">
        {/* Non-rescheduled consultation count */}
        {consultations > 0 && (
          <div className="flex items-center justify-center w-5 h-5 text-xs text-white bg-blue-400 rounded-full">
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
          <div className="flex items-center justify-center w-5 h-5 text-xs text-white bg-green-400 rounded-full">
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
        {maintenance > 0 && (
          <div className="flex items-center justify-center w-5 h-5 text-xs text-white bg-red-400 rounded-full">
            {maintenance}
          </div>
        )}
        {/* Rescheduled Follow-up count */}
        {rescheduledMaintenance > 0 && (
          <div className="flex items-center justify-center w-5 h-5 text-xs text-white bg-orange-500 rounded-full">
            {rescheduledMaintenance}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateCell;

