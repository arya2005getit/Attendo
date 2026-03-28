import { Course } from '@/types/attendance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CourseCardProps {
  course: Course;
  onDelete: (id: string) => void;
}

export const CourseCard = ({ course, onDelete }: CourseCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer animate-fade-in border-border/50 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div onClick={() => navigate(`/course/${course.id}`)} className="flex-1">
            <p className="text-xs font-medium text-primary mb-1">{course.code}</p>
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {course.name}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(course.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent onClick={() => navigate(`/course/${course.id}`)}>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {course.description || 'No description'}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" />
            <span>{course.students.length} students</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{new Date(course.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
