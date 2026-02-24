import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Subject {
    name: string;
    chapters: Array<Chapter>;
}
export interface StudyTarget {
    subjects: Array<string>;
    date: Time;
    chapters: Array<[string, string]>;
    isComplete: boolean;
}
export interface Chapter {
    name: string;
    totalPages: bigint;
    isComplete: boolean;
}
export interface backendInterface {
    addChapter(subjectName: string, chapterName: string, totalPages: bigint): Promise<void>;
    addSubject(name: string): Promise<void>;
    completeChapter(subjectName: string, chapterName: string): Promise<void>;
    completeStudyTarget(date: Time): Promise<void>;
    getAllSubjects(): Promise<Array<Subject>>;
    getStudyTarget(date: Time): Promise<StudyTarget>;
    getStudyTargetsInRange(startDate: Time, endDate: Time): Promise<Array<StudyTarget>>;
    getSubject(subjectName: string): Promise<Subject>;
    setStudyTarget(date: Time, subjects: Array<string>, chapters: Array<[string, string]>): Promise<void>;
}
