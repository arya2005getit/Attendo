import { useState, useEffect } from 'react';
import { Student } from '@/types/attendance';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AttendanceTableProps {
  students: Student[];
  date: string;
  existingRecords?: { studentId: string; present: boolean }[];
  onSave: (records: { studentId: string; present: boolean }[]) => void;
  onRemoveStudent: (studentId: string) => void;
}

export const AttendanceTable = ({ students, date, existingRecords, onSave, onRemoveStudent }: AttendanceTableProps) => {
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    students.forEach(s => {
      const existing = existingRecords?.find(r => r.studentId === s.id);
      initial[s.id] = existing?.present ?? false;
    });
    setAttendance(initial);
  }, [students, existingRecords, date]);

  const toggleAttendance = (studentId: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const markAllPresent = () => {
    const all: Record<string, boolean> = {};
    students.forEach(s => { all[s.id] = true; });
    setAttendance(all);
  };

  const markAllAbsent = () => {
    const all: Record<string, boolean> = {};
    students.forEach(s => { all[s.id] = false; });
    setAttendance(all);
  };

  const handleSave = () => {
    const records = Object.entries(attendance).map(([studentId, present]) => ({
      studentId,
      present,
    }));
    onSave(records);
    toast.success('Attendance saved successfully!');
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;

  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No students added yet. Add students to start taking attendance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={markAllPresent} className="gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Mark All Present
          </Button>
          <Button variant="outline" size="sm" onClick={markAllAbsent} className="gap-1.5">
            <XCircle className="h-4 w-4 text-destructive" />
            Mark All Absent
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Present: <span className="font-semibold text-success">{presentCount}</span> / {students.length}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-20">Roll No.</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead className="w-24 text-center">Present</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student, index) => (
              <TableRow 
                key={student.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <TableCell className="font-medium text-muted-foreground">
                  {student.rollNumber}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    {student.email && (
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={attendance[student.id] || false}
                    onCheckedChange={() => toggleAttendance(student.id)}
                    className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveStudent(student.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} className="gap-2 shadow-md">
          <Save className="h-4 w-4" />
          Save Attendance
        </Button>
      </div>
    </div>
  );
};
