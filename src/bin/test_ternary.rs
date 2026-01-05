use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = r#"<script>
  export let active;
</script>

<div class="thing {active ? 'active' : ''}">
  some stuff
</div>

<style>
  .thing {color: blue;}
  .active {color: blue;}
  .thing.active {color: blue;}

  .unused {color: blue;}
</style>"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("test.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    let result = compile(input, options).unwrap();

    if let Some(css) = result.css {
        println!("=== CSS Output ===");
        println!("{}", css.code);
    } else {
        println!("No CSS output");
    }
}
