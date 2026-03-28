import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { Course, AttendanceRecord, Student } from '@/types/attendance';

export const useFirestoreAttendance = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) {
      setCourses([]);
      setAttendanceRecords([]);
      setLoading(false);
      return;
    }

    // Subscribe to courses
    const coursesQuery = query(collection(db, 'courses'), where('userId', '==', userId));
    const unsubscribeCourses = onSnapshot(coursesQuery, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      setCourses(coursesData);
      setLoading(false);
    });

    // Subscribe to attendance records
    const attendanceQuery = query(collection(db, 'attendance'), where('userId', '==', userId));
    const unsubscribeAttendance = onSnapshot(attendanceQuery, (snapshot) => {
      const attendanceData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];
      setAttendanceRecords(attendanceData);
    });

    return () => {
      unsubscribeCourses();
      unsubscribeAttendance();
    };
  }, [userId]);

  const addCourse = async (course: Omit<Course, 'id' | 'students' | 'createdAt'>) => {
    if (!userId) return null;
    
    const newCourse = {
      ...course,
      userId,
      students: [],
      createdAt: new Date().toISOString(),
    };
    
    const docRef = await addDoc(collection(db, 'courses'), newCourse);
    return { id: docRef.id, ...newCourse } as Course;
  };

  const deleteCourse = async (courseId: string) => {
    await deleteDoc(doc(db, 'courses', courseId));
    
    // Delete related attendance records
    const attendanceQuery = query(
      collection(db, 'attendance'), 
      where('courseId', '==', courseId)
    );
    const snapshot = await getDocs(attendanceQuery);
    snapshot.docs.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  };

  const addStudent = async (courseId: string, student: Omit<Student, 'id'>) => {
    const courseDoc = doc(db, 'courses', courseId);
    const course = courses.find(c => c.id === courseId);
    
    if (!course) return null;
    
    const newStudent: Student = {
      ...student,
      id: crypto.randomUUID(),
    };
    
    await updateDoc(courseDoc, {
      students: [...course.students, newStudent]
    });
    
    return newStudent;
  };

  const removeStudent = async (courseId: string, studentId: string) => {
    const courseDoc = doc(db, 'courses', courseId);
    const course = courses.find(c => c.id === courseId);
    
    if (!course) return;
    
    await updateDoc(courseDoc, {
      students: course.students.filter(s => s.id !== studentId)
    });
  };

  const markAttendance = async (
    courseId: string, 
    date: string, 
    records: { studentId: string; present: boolean }[]
  ) => {
    if (!userId) return;
    
    const existing = attendanceRecords.find(
      r => r.courseId === courseId && r.date === date
    );

    if (existing) {
      await updateDoc(doc(db, 'attendance', existing.id), { records });
    } else {
      await addDoc(collection(db, 'attendance'), {
        userId,
        courseId,
        date,
        records,
      });
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
    loading,
    addCourse,
    deleteCourse,
    addStudent,
    removeStudent,
    markAttendance,
    getAttendanceForDate,
    getCourseAttendanceStats,
  };
};
