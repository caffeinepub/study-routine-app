import { useStudyTarget, useCompleteChapter, useSubjects } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, BookOpen, Target as TargetIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const today = BigInt(Date.now() * 1_000_000);
  const { data: target, isLoading, error } = useStudyTarget(today);
  const { data: subjects } = useSubjects();
  const completeChapterMutation = useCompleteChapter();

  const handleToggleChapter = (subjectName: string, chapterName: string, isComplete: boolean) => {
    if (!isComplete) {
      completeChapterMutation.mutate({ subjectName, chapterName });
    }
  };

  const getChapterCompletion = (subjectName: string, chapterName: string): boolean => {
    if (!subjects) return false;
    const subject = subjects.find((s) => s.name === subjectName);
    if (!subject) return false;
    const chapter = subject.chapters.find((c) => c.name === chapterName);
    return chapter?.isComplete ?? false;
  };

  const calculateProgress = () => {
    if (!target || !target.chapters.length) return 0;
    const completed = target.chapters.filter(([subject, chapter]) =>
      getChapterCompletion(subject, chapter)
    ).length;
    return Math.round((completed / target.chapters.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !target) {
    return (
      <div className="space-y-6">
        <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden bg-secondary">
          <img
            src="/assets/generated/study-hero.dim_1200x400.png"
            alt="Study Hero"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">
              Welcome to Your Study Dashboard
            </h1>
            <p className="text-lg text-white/80 drop-shadow">
              Track your progress and achieve your academic goals
            </p>
          </div>
        </div>

        <Card className="border-2 border-dashed border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TargetIcon className="w-5 h-5 text-primary" />
              No Study Target for Today
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              You haven't set a study target for today yet. Create one to get started!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/create-target">
              <Button className="w-full md:w-auto">
                <TargetIcon className="w-4 h-4 mr-2" />
                Create Today's Target
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/subjects">
            <Card className="hover:shadow-medium transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Manage Subjects
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Add and organize your study subjects and chapters
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link to="/calendar">
            <Card className="hover:shadow-medium transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TargetIcon className="w-5 h-5 text-primary" />
                  View Calendar
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  See your study history and upcoming targets
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const groupedChapters = target.chapters.reduce((acc, [subject, chapter]) => {
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(chapter);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="space-y-6">
      <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden bg-secondary">
        <img
          src="/assets/generated/study-hero.dim_1200x400.png"
          alt="Study Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">
            Today's Study Plan
          </h1>
          <p className="text-lg text-white/80 drop-shadow">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Overall Progress</CardTitle>
              <CardDescription className="text-muted-foreground">
                {target.chapters.length} chapter{target.chapters.length !== 1 ? 's' : ''} to complete today
              </CardDescription>
            </div>
            {target.isComplete && (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Complete
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Subjects & Chapters</h2>
        {Object.entries(groupedChapters).map(([subject, chapters]) => (
          <Card key={subject}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BookOpen className="w-5 h-5 text-primary" />
                {subject}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {chapters.length} chapter{chapters.length !== 1 ? 's' : ''} assigned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {chapters.map((chapter) => {
                  const isComplete = getChapterCompletion(subject, chapter);
                  return (
                    <div
                      key={chapter}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors"
                    >
                      <Checkbox
                        checked={isComplete}
                        onCheckedChange={() => handleToggleChapter(subject, chapter, isComplete)}
                        disabled={completeChapterMutation.isPending || isComplete}
                      />
                      <div className="flex-1">
                        <p className={`font-medium text-foreground ${isComplete ? 'line-through text-muted-foreground' : ''}`}>
                          {chapter}
                        </p>
                      </div>
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
