import { useState } from 'react';
import { useStudyTargetsRange } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Circle, BookOpen } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import type { StudyTarget } from '@/backend';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const startDateNano = BigInt(calendarStart.getTime() * 1_000_000);
  const endDateNano = BigInt(calendarEnd.getTime() * 1_000_000);

  const { data: targets, isLoading } = useStudyTargetsRange(startDateNano, endDateNano);

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTargetForDate = (date: Date): StudyTarget | undefined => {
    if (!targets) return undefined;
    return targets.find((target) => {
      const targetDate = new Date(Number(target.date / BigInt(1_000_000)));
      return isSameDay(targetDate, date);
    });
  };

  const calculateProgress = (target: StudyTarget) => {
    if (!target.chapters.length) return 0;
    return target.isComplete ? 100 : 0;
  };

  const selectedTarget = selectedDate ? getTargetForDate(selectedDate) : null;

  const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Study Calendar</h1>
        <p className="text-muted-foreground mt-1">
          View your study history and upcoming targets
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                {day}
              </div>
            ))}
            {calendarDays.map((day) => {
              const target = getTargetForDate(day);
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const progress = target ? calculateProgress(target) : 0;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative p-2 rounded-lg border transition-all
                    ${isCurrentMonth ? 'border-border' : 'border-transparent text-muted-foreground'}
                    ${isToday ? 'border-primary border-2' : ''}
                    ${isSelected ? 'bg-accent' : 'hover:bg-accent/50'}
                    ${target ? 'font-semibold' : ''}
                  `}
                >
                  <div className="text-sm">{format(day, 'd')}</div>
                  {target && (
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className={`h-1 rounded-full ${progress === 100 ? 'bg-primary' : 'bg-muted'}`} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
            <CardDescription>
              {selectedTarget ? 'Study target details' : 'No study target for this date'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedTarget ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Progress</p>
                    <p className="text-2xl font-bold">{calculateProgress(selectedTarget)}%</p>
                  </div>
                  {selectedTarget.isComplete && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Complete
                    </Badge>
                  )}
                </div>
                <Progress value={calculateProgress(selectedTarget)} className="h-2" />

                <div className="space-y-3 pt-4">
                  <h4 className="font-semibold">Chapters ({selectedTarget.chapters.length})</h4>
                  {selectedTarget.chapters.map(([subject, chapter], index) => (
                    <div
                      key={`${subject}-${chapter}-${index}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border"
                    >
                      {selectedTarget.isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{chapter}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {subject}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No study target set for this date
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
