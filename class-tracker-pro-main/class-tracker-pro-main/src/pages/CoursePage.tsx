import { useParams, useNavigate } from 'react-router-dom';
import { useFirestoreAttendance } from '@/hooks/useFirestoreAttendance';
import { useAuth } from '@/contexts/AuthContext';
import { AddStudentDialog } from '@/components/AddStudentDialog';
import { AttendanceTable } from '@/components/AttendanceTable';
import { AttendanceStats } from '@/components/AttendanceStats';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, CalendarDays, Users, BarChart3, GraduationCap, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    courses, 
    loading: dataLoading,
    addStudent, 
    removeStudent, 
    markAttendance, 
    getAttendanceForDate,
    getCourseAttendanceStats 
  } = useFirestoreAttendance();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;
  
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Go Back Home</Button>
        </div>
      </div>
    );
  }

  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const existingAttendance = getAttendanceForDate(course.id, dateString);
  const stats = getCourseAttendanceStats(course.id);

  const handleAddStudent = async (student: { name: string; email: string; rollNumber: string }) => {
    await addStudent(course.id, student);
    toast.success(`${student.name} added to the course`);
  };

  const handleRemoveStudent = async (studentId: string) => {
    await removeStudent(course.id, studentId);
    toast.success('Student removed');
  };

  const handleSaveAttendance = async (records: { studentId: string; present: boolean }[]) => {
    await markAttendance(course.id, dateString, records);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-primary">{course.code}</p>
                <h1 className="text-lg font-bold text-foreground truncate">{course.name}</h1>
              </div>
            </div>
            <AddStudentDialog onAdd={handleAddStudent} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto">
            <TabsTrigger value="attendance" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Students</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Statistics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-xl font-semibold">Mark Attendance</h2>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("gap-2 min-w-[180px] justify-start")}>
                    <CalendarDays className="h-4 w-4" />
                    {format(selectedDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <AttendanceTable
              students={course.students}
              date={dateString}
              existingRecords={existingAttendance?.records}
              onSave={handleSaveAttendance}
              onRemoveStudent={handleRemoveStudent}
            />
          </TabsContent>

          <TabsContent value="students" className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Students ({course.students.length})
              </h2>
            </div>
            
            {course.students.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No students enrolled yet.</p>
                <p className="text-sm">Add students using the button above.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {course.students.map((student, index) => (
                  <div 
                    key={student.id} 
                    className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-primary mb-1">{student.rollNumber}</p>
                        <p className="font-semibold text-foreground">{student.name}</p>
                        {student.email && (
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive -mt-1 -mr-2"
                        onClick={() => handleRemoveStudent(student.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-semibold">Attendance Statistics</h2>
            <AttendanceStats stats={stats} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CoursePage;
