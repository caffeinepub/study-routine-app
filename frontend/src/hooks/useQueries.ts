import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Subject, StudyTarget, Time } from '@/backend';

// Subjects
export function useSubjects() {
  const { actor, isFetching } = useActor();

  return useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addSubject(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

export function useAddChapter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subjectName,
      chapterName,
      totalPages,
    }: {
      subjectName: string;
      chapterName: string;
      totalPages: bigint;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addChapter(subjectName, chapterName, totalPages);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

export function useCompleteChapter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subjectName,
      chapterName,
    }: {
      subjectName: string;
      chapterName: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.completeChapter(subjectName, chapterName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['studyTarget'] });
      queryClient.invalidateQueries({ queryKey: ['studyTargetsRange'] });
    },
  });
}

// Study Targets
export function useStudyTarget(date: Time) {
  const { actor, isFetching } = useActor();

  return useQuery<StudyTarget | null>({
    queryKey: ['studyTarget', date.toString()],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getStudyTarget(date);
      } catch (error) {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStudyTargetsRange(startDate: Time, endDate: Time) {
  const { actor, isFetching } = useActor();

  return useQuery<StudyTarget[]>({
    queryKey: ['studyTargetsRange', startDate.toString(), endDate.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudyTargetsInRange(startDate, endDate);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStudyTarget() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      subjects,
      chapters,
    }: {
      date: Time;
      subjects: string[];
      chapters: [string, string][];
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.setStudyTarget(date, subjects, chapters);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyTarget'] });
      queryClient.invalidateQueries({ queryKey: ['studyTargetsRange'] });
    },
  });
}

export function useCompleteStudyTarget() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (date: Time) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.completeStudyTarget(date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyTarget'] });
      queryClient.invalidateQueries({ queryKey: ['studyTargetsRange'] });
    },
  });
}
