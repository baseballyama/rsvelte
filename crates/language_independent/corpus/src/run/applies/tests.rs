use super::{Applies, Unit, tasks_per_unit};

#[test]
fn a_task_runs_on_a_unit_unless_its_predicate_rejects_it() {
    let module: Applies = |u| u.language == "svelte-module-ts" && !u.path.ends_with(".d.svelte.ts");
    let unit = |language, path| Unit { language, path };
    let units = [
        unit("svelte", "a.svelte"),
        unit("svelte-module-ts", "b.svelte.ts"),
        unit("svelte-module-ts", "c.d.svelte.ts"),
        unit("svelte", "d.svelte"),
    ];
    let (lists, list_of) = tasks_per_unit(&["compile", "ts"], &[("ts", module)], &units);
    let tasks: Vec<&[&str]> = list_of.iter().map(|&i| lists[i].as_slice()).collect();
    assert_eq!(
        tasks,
        [
            &["compile"][..],
            &["compile", "ts"],
            &["compile"],
            &["compile"]
        ]
    );
    assert_eq!(lists.len(), 2, "one list per distinct answer");
}
