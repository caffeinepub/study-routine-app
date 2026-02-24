import { useState } from 'react';
import { useSubjects, useSetStudyTarget } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Target, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';

export default function CreateTargetPage() {
  const navigate = useNavigate();
  const { data: subjects, isLoading } = useSubjects();
  const setTargetMutation = useSetStudyTarget();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedChapters, setSelectedChapters] = useState<Map<string, Set<string>>>(new Map());

  const handleToggleChapter = (subjectName: string, chapterName: string) => {
    setSelectedChapters((prev) => {
      const newMap = new Map(prev);
      const subjectChapters = newMap.get(subjectName) || new Set();
      
      if (subjectChapters.has(chapterName)) {
        subjectChapters.delete(chapterName);
        if (subjectChapters.size === 0) {
          newMap.delete(subjectName);
        } else {
          newMap.set(subjectName, subjectChapters);
        }
      } else {
        subjectChapters.add(chapterName);
        newMap.set(subjectName, subjectChapters);
      }
      
      return newMap;
    });
  };

  const handleCreateTarget = async () => {
    if (selectedChapters.size === 0) {
      toast.error('Please select at least one chapter');
      return;
    }

    const subjectsList: string[] = [];
    const chaptersList: [string, string][] = [];

    selectedChapters.forEach((chapters, subject) => {
      if (!subjectsList.includes(subject)) {
        subjectsList.push(subject);
      }
      chapters.forEach((chapter) => {
        chaptersList.push([subject, chapter]);
      });
    });

    const dateInNanoseconds = BigInt(selectedDate.setHours(0, 0, 0, 0) * 1_000_000);

    try {
      await setTargetMutation.mutateAsync({
        date: dateInNanoseconds,
        subjects: subjectsList,
        chapters: chaptersList,
      });
      toast.success('Study target created successfully');
      navigate({ to: '/' });
    } catch (error) {
      toast.error('Failed to create study target');
    }
  };

  const getTotalSelectedChapters = () => {
    let total = 0;
    selectedChapters.forEach((chapters) => {
      total += chapters.size;
    });
    return total;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Create Study Target</h1>
        <p className="text-muted-foreground mt-1">
          Set your study goals for a specific date
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Target Date</CardTitle>
          <CardDescription>
            Choose the date for your study target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Chapters</CardTitle>
              <CardDescription>
                Choose the chapters you want to study
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {getTotalSelectedChapters()} selected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!subjects || subjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No subjects available. Add subjects first to create study targets.
              </p>
              <Button onClick={() => navigate({ to: '/subjects' })}>
                Go to Subjects
              </Button>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {subjects.map((subject) => {
                const subjectChapters = selectedChapters.get(subject.name) || new Set();
                const selectedCount = subjectChapters.size;

                return (
                  <AccordionItem key={subject.name} value={subject.name} className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <div className="text-left">
                          <p className="font-semibold">{subject.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {subject.chapters.length} chapters
                            {selectedCount > 0 && ` • ${selectedCount} selected`}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      {subject.chapters.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No chapters available for this subject
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {subject.chapters.map((chapter) => {
                            const isSelected = subjectChapters.has(chapter.name);
                            return (
                              <div
                                key={chapter.name}
                                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                                onClick={() => handleToggleChapter(subject.name, chapter.name)}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => handleToggleChapter(subject.name, chapter.name)}
                                />
                                <div className="flex-1">
                                  <p className="font-medium">{chapter.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {Number(chapter.totalPages)} pages
                                  </p>
                                </div>
                                {chapter.isComplete && (
                                  <Badge variant="outline" className="text-xs">
                                    Previously completed
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/' })}
          className="flex-1 md:flex-none"
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreateTarget}
          disabled={getTotalSelectedChapters() === 0 || setTargetMutation.isPending}
          className="flex-1 md:flex-none"
        >
          <Target className="w-4 h-4 mr-2" />
          {setTargetMutation.isPending ? 'Creating...' : 'Create Target'}
        </Button>
      </div>
    </div>
  );
}
