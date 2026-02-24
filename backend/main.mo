import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";

actor {
  type Chapter = {
    name : Text;
    totalPages : Nat;
    isComplete : Bool;
  };

  type Subject = {
    name : Text;
    chapters : [Chapter];
  };

  type StudyTarget = {
    date : Time.Time;
    subjects : [Text];
    chapters : [(Text, Text)];
    isComplete : Bool;
  };

  let subjects = Map.empty<Text, Subject>();
  let studyTargets = Map.empty<Time.Time, StudyTarget>();

  // Subject Management
  public shared ({ caller }) func addSubject(name : Text) : async () {
    if (subjects.containsKey(name)) { Runtime.trap("Subject already exists") };
    let subject : Subject = { name; chapters = [] };
    subjects.add(name, subject);
  };

  public shared ({ caller }) func addChapter(subjectName : Text, chapterName : Text, totalPages : Nat) : async () {
    switch (subjects.get(subjectName)) {
      case (null) { Runtime.trap("Subject not found") };
      case (?subject) {
        let chapter : Chapter = {
          name = chapterName;
          totalPages;
          isComplete = false;
        };
        let updatedChapters = subject.chapters.concat([chapter]);
        let updatedSubject : Subject = {
          name = subject.name;
          chapters = updatedChapters;
        };
        subjects.add(subjectName, updatedSubject);
      };
    };
  };

  public shared ({ caller }) func completeChapter(subjectName : Text, chapterName : Text) : async () {
    switch (subjects.get(subjectName)) {
      case (null) { Runtime.trap("Subject not found") };
      case (?subject) {
        let chaptersArray = subject.chapters;
        let chapterIndex = chaptersArray.findIndex(func(chapter) { chapter.name == chapterName });
        switch (chapterIndex) {
          case (null) { Runtime.trap("Chapter not found") };
          case (?index) {
            let updatedChapter : Chapter = {
              name = chaptersArray[index].name;
              totalPages = chaptersArray[index].totalPages;
              isComplete = true;
            };
            var updatedChapters = chaptersArray.toVarArray<Chapter>();
            updatedChapters[index] := updatedChapter;
            let updatedSubject : Subject = {
              name = subject.name;
              chapters = updatedChapters.toArray();
            };
            subjects.add(subjectName, updatedSubject);
          };
        };
      };
    };
  };

  // Study Targets Management
  public shared ({ caller }) func setStudyTarget(date : Time.Time, subjects : [Text], chapters : [(Text, Text)]) : async () {
    let target : StudyTarget = {
      date;
      subjects;
      chapters;
      isComplete = false;
    };
    studyTargets.add(date, target);
  };

  public shared ({ caller }) func completeStudyTarget(date : Time.Time) : async () {
    switch (studyTargets.get(date)) {
      case (null) { Runtime.trap("Study target not found") };
      case (?target) {
        let completedTarget : StudyTarget = {
          date = target.date;
          subjects = target.subjects;
          chapters = target.chapters;
          isComplete = true;
        };
        studyTargets.add(date, completedTarget);
      };
    };
  };

  // Query functions
  public query ({ caller }) func getSubject(subjectName : Text) : async Subject {
    switch (subjects.get(subjectName)) {
      case (null) { Runtime.trap("Subject not found") };
      case (?subject) { subject };
    };
  };

  public query ({ caller }) func getAllSubjects() : async [Subject] {
    subjects.values().toArray();
  };

  public query ({ caller }) func getStudyTarget(date : Time.Time) : async StudyTarget {
    switch (studyTargets.get(date)) {
      case (null) { Runtime.trap("Study target not found") };
      case (?target) { target };
    };
  };

  public query ({ caller }) func getStudyTargetsInRange(startDate : Time.Time, endDate : Time.Time) : async [StudyTarget] {
    let targetsArray = studyTargets.values().toArray();
    targetsArray.filter(func(target) { target.date >= startDate and target.date <= endDate });
  };
};
