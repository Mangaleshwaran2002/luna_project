// In your parent component, e.g., ReschedulePage.tsx

import RescheduleRecordsTable from "@/components/RescheduleRecordsTable";

export default function ReschedulePage() {
  return (
    <div>
        <h1 className="text-xl md:text-2xl font-bold my-2 md:my-5 mx-3 text-center md:text-justify ">Reschedule Records</h1>
      <RescheduleRecordsTable />
    </div>
  );
}
