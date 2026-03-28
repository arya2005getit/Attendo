import { useState, useEffect } from 'react';
import { Course, AttendanceRecord, Student } from '@/types/attendance';

const COURSES_KEY = 'attendance_courses';
const ATTENDANCE_KEY = 'attendance_records';

export const useAttendanceStore = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const storedCourses = localStorage.getItem(COURSES_KEY);
    const storedAttendance = localStorage.getItem(ATTENDANCE_KEY);
    
    if (storedCourses) setCourses(JSON.parse(storedCourses));
    if (storedAttendance) setAttendanceRecords(JSON.parse(storedAttendance));
  }, []);

  const saveCourses = (newCourses: Course[]) => {
    setCourses(newCourses);
    localStorage.setItem(COURSES_KEY, JSON.stringify(newCourses));
  };

  const saveAttendance = (newRecords: AttendanceRecord[]) => {
    setAttendanceRecords(newRecords);
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(newRecords));
  };

  const addCourse = (course: Omit<Course, 'id' | 'students' | 'createdAt'>) => {
    const newCourse: Course = {
      ...course,
      id: crypto.randomUUID(),
      students: [],
      createdAt: new Date().toISOString(),
    };
    saveCourses([...courses, newCourse]);
    return newCourse;
  };

  const deleteCourse = (courseId: string) => {
    saveCourses(courses.filter(c => c.id !== courseId));
    saveAttendance(attendanceRecords.filter(r => r.courseId !== courseId));
  };

  const addStudent = (courseId: string, student: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...student,
      id: crypto.randomUUID(),
    };
    saveCourses(
      courses.map(c =>
        c.id === courseId
          ? { ...c, students: [...c.students, newStudent] }
          : c
      )
    );
    return newStudent;
  };

  const removeStudent = (courseId: string, studentId: string) => {
    saveCourses(
      courses.map(c =>
        c.id === courseId
          ? { ...c, students: c.students.filter(s => s.id !== studentId) }
          : c
      )
    );
  };

  const markAttendance = (courseId: string, date: string, records: { studentId: string; present: boolean }[]) => {
    const existingIndex = attendanceRecords.findIndex(
      r => r.courseId === courseId && r.date === date
    );

    if (existingIndex >= 0) {
      const updated = [...attendanceRecords];
      updated[existingIndex] = { ...updated[existingIndex], records };
      saveAttendance(updated);
    } else {
      const newRecord: AttendanceRecord = {
        id: crypto.randomUUID(),
        courseId,
        date,
        records,
      };
      saveAttendance([...attendanceRecords, newRecord]);
    }
  };

  const getAttendanceForDate = (courseId: string, date: string) => {
    return attendanceRecords.find(r => r.courseId === courseId && r.date === date);
  };

  const getCourseAttendanceStats = (courseId: string) => {
    const courseRecords = attendanceRecords.filter(r => r.courseId === courseId);
    const course = courses.find(c => c.id === courseId);
    
    if (!course || courseRecords.length === 0) return null;

    const studentStats = course.students.map(student => {
      const totalClasses = courseRecords.length;
      const attended = courseRecords.filter(r =>
        r.records.find(rec => rec.studentId === student.id && rec.present)
      ).length;
      
      return {
        student,
        attended,
        totalClasses,
        percentage: totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 0,
      };
    });

    return studentStats;
  };

  return {
    courses,
    attendanceRecords,
    addCourse,
    deleteCourse,
    addStudent,
    removeStudent,
    markAttendance,
    getAttendanceForDate,
    getCourseAttendanceStats,
  };
};
