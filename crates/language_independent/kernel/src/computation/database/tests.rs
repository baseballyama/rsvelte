use super::*;

#[cfg(feature = "trace-artifacts")]
#[test]
fn access_trace_distinguishes_computation_from_cache_hits() {
    let mut registry = ArtifactRegistry::default();
    registry.register::<First>();
    let document = Document::new("file".into(), String::new()).expect("valid document");
    let context = DocumentContext::new(&document, &registry);
    context.get::<First>();
    context.get::<First>();
    assert_eq!(context.computed(), ["same"]);
    assert_eq!(
        context.accesses(),
        [
            ArtifactAccess {
                name: "same",
                cached: false
            },
            ArtifactAccess {
                name: "same",
                cached: true
            },
        ]
    );
}

struct First;
impl Artifact for First {
    type Output = ();

    const NAME: &'static str = "same";

    fn compute(_: &DocumentContext<'_>) {}
}

struct Second;
impl Artifact for Second {
    type Output = ();

    const NAME: &'static str = "same";

    fn compute(_: &DocumentContext<'_>) {}
}

#[test]
#[should_panic(expected = "name `same` is registered twice")]
fn distinct_artifacts_cannot_share_a_name() {
    let mut registry = ArtifactRegistry::default();
    registry.register::<First>();
    registry.register::<Second>();
}
