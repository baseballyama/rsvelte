use std::path::Path;
use rsvelte_svelte::compilation::compiler_syntax_tree;
use rsvelte_svelte::semantic::{analyze, resolve};
use rsvelte_svelte_compile::{CompileInput, OutputIdentity, Target, compile, stylesheet};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut outputs = 0;
    for root in std::env::args().skip(1) {
        let mut directories = std::fs::read_dir(root)?.collect::<Result<Vec<_>, _>>()?;
        directories.sort_by_key(std::fs::DirEntry::path);
        for directory in directories {
            if !directory.file_type()?.is_dir() { continue; }
            let path = directory.path();
            let source = std::fs::read_to_string(path.join("input.svelte"))?;
            let filename = directory.file_name().to_string_lossy().into_owned();
            let component = rsvelte_svelte::syntax::parse::parse(&source)
                .map_err(|error| format!("{filename}: {error:?}"))?;
            let tree = compiler_syntax_tree::lower(&component, &source);
            let input = rsvelte_svelte::svelte_input(&component, &tree, &source, &filename);
            let resolution = resolve::resolve_with_module(&component.javascript, component.program,
                component.module.as_ref().map(|script| script.program), &tree);
            let analysis = analyze::analyze(&input, &resolution);
            let css = stylesheet::scoped_stylesheet(&input, &analysis, &OutputIdentity::build(&input))
                .ok_or("the probes require CSS")?;
            let input = CompileInput::from(input);
            let output = path.join("actual/svelte.compile");
            std::fs::create_dir_all(&output)?;
            for (name, target) in [("client", Target::Client), ("server", Target::Server)] {
                let js = compile(&input, &resolution, &analysis, target)
                    .map_err(|error| format!("{filename}: {error:?}"))?;
                std::fs::write(output.join(Path::new(name).with_extension("js")), js)?;
                std::fs::write(output.join(Path::new(name).with_extension("css")), &css)?;
                outputs += 1;
            }
        }
    }
    println!("generated {outputs} outputs");
    Ok(())
}
