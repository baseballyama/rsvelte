use std::marker::PhantomData;

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_svelte::compilation::input::Target;

/// One of the two targets, as a type, so each gets its own chain of artifacts.
pub trait Side: Send + Sync + 'static {
    const TARGET: Target;
    const TASK: &'static str;
    const TRANSLATED: &'static str;
    const RESOLVED: &'static str;
    const ANALYZED: &'static str;
}

#[derive(Debug)]
pub struct Client;

impl Side for Client {
    const ANALYZED: &'static str = "svue.analyze.client";
    const RESOLVED: &'static str = "svue.resolve.client";
    const TARGET: Target = Target::Client;
    const TASK: &'static str = "svue.compile/client";
    const TRANSLATED: &'static str = "svue.translate.client";
}

#[derive(Debug)]
pub struct Server;

impl Side for Server {
    const ANALYZED: &'static str = "svue.analyze.server";
    const RESOLVED: &'static str = "svue.resolve.server";
    const TARGET: Target = Target::Server;
    const TASK: &'static str = "svue.compile/server";
    const TRANSLATED: &'static str = "svue.translate.server";
}

/// The translation, or why there is none; `None` when the document did not parse (the error is
/// on [`rsvelte_vue::Parsed`]).
#[derive(Debug)]
pub struct Translated<S>(PhantomData<S>);

impl<S: Side> Artifact for Translated<S> {
    type Output = Option<Result<Translation, Diagnostic>>;

    const NAME: &'static str = S::TRANSLATED;

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let sfc = context.get::<rsvelte_vue::Parsed>().as_ref().ok()?;
        let compiler_syntax_tree = context.get::<rsvelte_vue::Lowered>().as_ref();
        let resolution = context.get::<rsvelte_vue::Resolved>().as_ref()?;
        Some(translate(
            sfc,
            compiler_syntax_tree,
            resolution,
            context.source_text(),
            S::TARGET,
        ))
    }
}

/// Svelte's name resolution over the translation.
#[derive(Debug)]
pub struct Resolved<S>(PhantomData<S>);

impl<S: Side> Artifact for Resolved<S> {
    type Output = Option<rsvelte_svelte::semantic::resolve::Resolution>;

    const NAME: &'static str = S::RESOLVED;

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let t = context.get::<Translated<S>>().as_ref()?.as_ref().ok()?;
        Some(rsvelte_svelte::semantic::resolve::resolve(
            &t.javascript,
            t.program,
            &t.compiler_syntax_tree,
        ))
    }
}

/// Svelte's analysis over the translation.
#[derive(Debug)]
pub struct Analyzed<S>(PhantomData<S>);

impl<S: Side> Artifact for Analyzed<S> {
    type Output = Option<rsvelte_svelte::semantic::analyze::Analysis>;

    const NAME: &'static str = S::ANALYZED;

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let t = context.get::<Translated<S>>().as_ref()?.as_ref().ok()?;
        let resolution = context.get::<Resolved<S>>().as_ref()?;
        Some(rsvelte_svelte::semantic::analyze::analyze(
            &t.compile_input(context.source_text()),
            resolution,
            &context.document.path,
        ))
    }
}

/// Registers svue's tasks on `.vue` documents, and the Vue plugin's artifacts they read (which
/// [`rsvelte_vue::register`] registers too; a second registration is a no-op).
pub fn register(reg: &mut Registry) {
    reg.artifact::<rsvelte_vue::Parsed>()
        .artifact::<rsvelte_vue::Lowered>()
        .artifact::<rsvelte_vue::Resolved>()
        .artifact::<Translated<Client>>()
        .artifact::<Resolved<Client>>()
        .artifact::<Analyzed<Client>>()
        .artifact::<Translated<Server>>()
        .artifact::<Resolved<Server>>()
        .artifact::<Analyzed<Server>>()
        .task(Compile::<Client>(PhantomData))
        .task(Compile::<Server>(PhantomData));
}

/// The module `svelte/compiler` would emit for the translation, for one target.
#[derive(Debug)]
pub struct Compile<S>(PhantomData<S>);

impl<S: Side> Task for Compile<S> {
    fn identifier(&self) -> &'static str {
        S::TASK
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_vue::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        if let Err(e) = context.get::<rsvelte_vue::Parsed>() {
            out.diagnostics.push(e.clone());
            return;
        }
        let t = match context.get::<Translated<S>>() {
            Some(Ok(t)) => t,
            Some(Err(e)) => {
                out.diagnostics.push(e.clone());
                return;
            }
            None => unreachable!("a parsed component is translated"),
        };
        let resolution = context
            .get::<Resolved<S>>()
            .as_ref()
            .expect("a translation is resolved");
        let analysis = context
            .get::<Analyzed<S>>()
            .as_ref()
            .expect("a translation is analysed");
        match rsvelte_svelte_compile::compile(
            &t.compile_input(context.source_text()),
            resolution,
            analysis,
            S::TARGET,
        ) {
            Ok(javascript) => out.file("js", javascript),
            Err(d) => out.diagnostics.push(d),
        }
    }
}

use crate::compilation::{Translation, translate};
