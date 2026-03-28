import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Student } from '@/types/attendance';

interface StudentStat {
  student: Student;
  attended: number;
  totalClasses: number;
  percentage: number;
}

interface AttendanceStatsProps {
  stats: StudentStat[] | null;
}

export const AttendanceStats = ({ stats }: AttendanceStatsProps) => {
  if (!stats || stats.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No attendance records yet.</p>
      </div>
    );
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-success';
    if (percentage >= 50) return 'bg-accent';
    return 'bg-destructive';
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-20">Roll No.</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead className="w-32 text-center">Classes</TableHead>
            <TableHead className="w-48">Attendance %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((stat, index) => (
            <TableRow 
              key={stat.student.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <TableCell className="font-medium text-muted-foreground">
                {stat.student.rollNumber}
              </TableCell>
              <TableCell className="font-medium">{stat.student.name}</TableCell>
              <TableCell className="text-center">
                <span className="text-success font-medium">{stat.attended}</span>
                <span className="text-muted-foreground"> / {stat.totalClasses}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Progress 
                    value={stat.percentage} 
                    className="h-2 flex-1"
                    indicatorClassName={getProgressColor(stat.percentage)}
                  />
                  <span className={`text-sm font-semibold min-w-[3rem] text-right ${
                    stat.percentage >= 75 ? 'text-success' : 
                    stat.percentage >= 50 ? 'text-accent' : 'text-destructive'
                  }`}>
                    {stat.percentage}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
