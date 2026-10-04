use std::fmt::Write;
use std::path::Path;

use rsvelte_svelte::compilation::compiler_syntax_tree;
use rsvelte_svelte::semantic::{analyze, resolve};
use rsvelte_svelte_compile::{OutputIdentity, stylesheet};

#[expect(
    clippy::unwrap_in_result,
    reason = "descendant paths and String formatting cannot fail"
)]
fn visit(
    root: &Path,
    corpus: &Path,
    dir: &Path,
    report: &mut String,
    counts: &mut [usize; 3],
) -> std::io::Result<()> {
    if dir.join("input.svelte").is_file() {
        let expected = dir.join("expected/svelte.compile/client.css");
        if !expected.is_file() {
            return Ok(());
        }
        let source = std::fs::read_to_string(dir.join("input.svelte"))?;
        let filename = dir
            .strip_prefix(root)
            .expect("a descendant")
            .to_string_lossy()
            .replace('~', "");
        let unit = dir
            .strip_prefix(corpus)
            .expect("a descendant")
            .display()
            .to_string();
        counts[0] += 1;
        match rsvelte_svelte::syntax::parse::parse(&source) {
            Ok(component) => {
                let tree = compiler_syntax_tree::lower(&component, &source);
                let input = rsvelte_svelte::svelte_input(&component, &tree, &source, &filename);
                let resolution = resolve::resolve_with_module(
                    &component.javascript,
                    component.program,
                    component.module.as_ref().map(|s| s.program),
                    &tree,
                );
                let analysis = analyze::analyze(&input, &resolution);
                let actual = stylesheet::scoped_stylesheet(
                    &input,
                    &analysis,
                    &OutputIdentity::build(&input),
                );
                if actual.as_deref() == Some(std::fs::read_to_string(expected)?.as_str()) {
                    counts[1] += 1;
                } else {
                    writeln!(report, "mismatch\t{unit}").expect("a string");
                    if let Some(actual) = actual {
                        let out = dir.join("actual/svelte.compile");
                        std::fs::create_dir_all(&out)?;
                        std::fs::write(out.join("styling.css"), actual)?;
                    }
                }
            }
            Err(error) => {
                counts[2] += 1;
                writeln!(
                    report,
                    "unparsed\t{unit}\t{}\t{}\t{}",
                    error.message, error.span.start_offset, error.code
                )
                .expect("a string");
            }
        }
        return Ok(());
    }
    let mut children = std::fs::read_dir(dir)?.collect::<Result<Vec<_>, _>>()?;
    children.sort_by_key(std::fs::DirEntry::path);
    for child in children {
        if child.file_type()?.is_dir() {
            visit(root, corpus, &child.path(), report, counts)?;
        }
    }
    Ok(())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let arguments: Vec<_> = std::env::args().skip(1).collect();
    let family = arguments.iter().any(|arg| arg == "--family");
    let check = arguments.iter().any(|arg| arg == "--check");
    let arguments: Vec<_> = arguments
        .iter()
        .filter(|arg| !matches!(arg.as_str(), "--family" | "--check"))
        .collect();
    if arguments.len() != 2 {
        return Err("expected <fixtures/family/source> <report.tsv>".into());
    }
    let root = Path::new(&arguments[0]);
    let mut report = String::new();
    let mut counts = [0; 3];
    if family {
        let mut sources = std::fs::read_dir(root)?.collect::<Result<Vec<_>, _>>()?;
        sources.sort_by_key(std::fs::DirEntry::path);
        for source in sources {
            if source.file_type()?.is_dir() {
                visit(
                    &source.path(),
                    root,
                    &source.path(),
                    &mut report,
                    &mut counts,
                )?;
            }
        }
    } else {
        visit(root, root, root, &mut report, &mut counts)?;
    }
    if counts[0] == 0 {
        return Err("the corpus contains no CSS oracle outputs".into());
    }
    writeln!(
        report,
        "population\t{}\nmatched\t{}\nunparsed\t{}\nmismatched\t{}",
        counts[0],
        counts[1],
        counts[2],
        counts[0] - counts[1] - counts[2]
    )?;
    std::fs::write(arguments[1], report)?;
    if check && counts[0] != counts[1] + counts[2] {
        return Err("the parsed corpus has CSS differences".into());
    }
    Ok(())
}
