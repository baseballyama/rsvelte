use super::*;

#[test]
fn a_named_task_runs_whatever_its_kind() {
    let selection = Selection::Named(vec!["a/default".to_owned()]);
    assert!(selection.runs("a/default", TaskKind::Finish));
    assert!(selection.runs("a/default", TaskKind::Document));
    assert!(!selection.runs("b/default", TaskKind::Document));
}

#[test]
fn every_runs_project_passes_and_document_tasks_does_not() {
    assert!(Selection::Every.runs("a", TaskKind::Finish));
    assert!(Selection::DocumentTasks.runs("a", TaskKind::Document));
    assert!(!Selection::DocumentTasks.runs("a", TaskKind::Finish));
}

#[test]
fn only_an_unnamed_task_says_why_it_runs() {
    assert_eq!(Selection::Named(Vec::new()).unnamed_reason(), "");
    assert_ne!(Selection::Every.unnamed_reason(), "");
    assert_ne!(Selection::DocumentTasks.unnamed_reason(), "");
}
