import { useState } from 'react';
import { useSubjects, useAddSubject, useAddChapter } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Plus, CheckCircle2, Circle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function SubjectsPage() {
  const { data: subjects, isLoading } = useSubjects();
  const addSubjectMutation = useAddSubject();
  const addChapterMutation = useAddChapter();

  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterPages, setNewChapterPages] = useState('');

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      toast.error('Please enter a subject name');
      return;
    }

    try {
      await addSubjectMutation.mutateAsync(newSubjectName.trim());
      toast.success('Subject added successfully');
      setNewSubjectName('');
      setIsSubjectDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add subject');
    }
  };

  const handleAddChapter = async () => {
    if (!newChapterName.trim() || !newChapterPages) {
      toast.error('Please fill in all fields');
      return;
    }

    const pages = parseInt(newChapterPages);
    if (isNaN(pages) || pages <= 0) {
      toast.error('Please enter a valid number of pages');
      return;
    }

    try {
      await addChapterMutation.mutateAsync({
        subjectName: selectedSubject,
        chapterName: newChapterName.trim(),
        totalPages: BigInt(pages),
      });
      toast.success('Chapter added successfully');
      setNewChapterName('');
      setNewChapterPages('');
      setIsChapterDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add chapter');
    }
  };

  const calculateSubjectProgress = (chapters: Array<{ isComplete: boolean }>) => {
    if (chapters.length === 0) return 0;
    const completed = chapters.filter(c => c.isComplete).length;
    return Math.round((completed / chapters.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subjects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your study subjects and chapters
          </p>
        </div>
        <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>
                Create a new subject to organize your study materials
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject-name">Subject Name</Label>
                <Input
                  id="subject-name"
                  placeholder="e.g., Mathematics, Physics, History"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSubjectDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSubject} disabled={addSubjectMutation.isPending}>
                {addSubjectMutation.isPending ? 'Adding...' : 'Add Subject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!subjects || subjects.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle>No Subjects Yet</CardTitle>
            <CardDescription>
              Get started by adding your first subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsSubjectDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Subject
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-4">
          {subjects.map((subject) => {
            const progress = calculateSubjectProgress(subject.chapters);
            const completedCount = subject.chapters.filter(c => c.isComplete).length;

            return (
              <AccordionItem key={subject.name} value={subject.name} className="border rounded-lg">
                <Card>
                  <AccordionTrigger className="hover:no-underline px-6 py-4">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <div className="text-left">
                          <h3 className="font-semibold text-lg">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {subject.chapters.length} chapter{subject.chapters.length !== 1 ? 's' : ''}
                            {' • '}
                            {completedCount} completed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 hidden md:block">
                          <Progress value={progress} className="h-2" />
                        </div>
                        <Badge variant={progress === 100 ? 'default' : 'secondary'}>
                          {progress}%
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Chapters</h4>
                          <Dialog open={isChapterDialogOpen && selectedSubject === subject.name} onOpenChange={(open) => {
                            setIsChapterDialogOpen(open);
                            if (open) setSelectedSubject(subject.name);
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Chapter
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Chapter to {subject.name}</DialogTitle>
                                <DialogDescription>
                                  Add a new chapter to track your progress
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="chapter-name">Chapter Name</Label>
                                  <Input
                                    id="chapter-name"
                                    placeholder="e.g., Chapter 1: Introduction"
                                    value={newChapterName}
                                    onChange={(e) => setNewChapterName(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="chapter-pages">Total Pages</Label>
                                  <Input
                                    id="chapter-pages"
                                    type="number"
                                    placeholder="e.g., 25"
                                    value={newChapterPages}
                                    onChange={(e) => setNewChapterPages(e.target.value)}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsChapterDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleAddChapter} disabled={addChapterMutation.isPending}>
                                  {addChapterMutation.isPending ? 'Adding...' : 'Add Chapter'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>

                        {subject.chapters.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No chapters yet. Add your first chapter to get started.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {subject.chapters.map((chapter) => (
                              <div
                                key={chapter.name}
                                className="flex items-center gap-3 p-3 rounded-lg border border-border"
                              >
                                {chapter.isComplete ? (
                                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                                ) : (
                                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                  <p className={`font-medium ${chapter.isComplete ? 'line-through text-muted-foreground' : ''}`}>
                                    {chapter.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {Number(chapter.totalPages)} pages
                                  </p>
                                </div>
                                {chapter.isComplete && (
                                  <Badge variant="default">Completed</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
