import { useFirestoreAttendance } from '@/hooks/useFirestoreAttendance';
import { useAuth } from '@/contexts/AuthContext';
import { CourseCard } from '@/components/CourseCard';
import { AddCourseDialog } from '@/components/AddCourseDialog';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { courses, loading: dataLoading, addCourse, deleteCourse } = useFirestoreAttendance();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleAddCourse = async (course: { name: string; code: string; description: string }) => {
    await addCourse(course);
    toast.success('Course created successfully!');
  };

  const handleDeleteCourse = async (id: string) => {
    await deleteCourse(id);
    toast.success('Course deleted');
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error(error);
    } else {
      toast.success('Signed out');
      navigate('/auth');
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AttendTrack</h1>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AddCourseDialog onAdd={handleAddCourse} />
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">No Courses Yet</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Create your first course to start tracking student attendance. You can add students and mark their attendance daily.
            </p>
            <AddCourseDialog onAdd={handleAddCourse} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Your Courses</h2>
                <p className="text-muted-foreground">
                  {courses.length} {courses.length === 1 ? 'course' : 'courses'} total
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => (
                <div key={course.id} style={{ animationDelay: `${index * 50}ms` }}>
                  <CourseCard course={course} onDelete={handleDeleteCourse} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
