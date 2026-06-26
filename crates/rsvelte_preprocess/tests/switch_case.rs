//! Port of the upstream `svelte-switch-case` test suite
//! (`submodules/svelte-switch-case/test/index.test.ts`).
//!
//! The upstream tests compare whitespace-collapsed ("minified") output, so we
//! reproduce the same `minify` normalization here and drive the transform
//! through the real `rsvelte_core` preprocess engine (the path a user's
//! `svelte.config.js` would take).

use rsvelte_core::compiler::preprocess::preprocess;
use rsvelte_preprocess::switch_case;

/// Collapse all runs of whitespace to a single space and trim — mirrors the
/// upstream test helper.
fn minify(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut prev_space = false;
    for c in s.chars() {
        if c.is_whitespace() {
            if !prev_space {
                out.push(' ');
            }
            prev_space = true;
        } else {
            out.push(c);
            prev_space = false;
        }
    }
    out.trim().to_string()
}

fn run(code: &str) -> Result<String, String> {
    let rt = tokio::runtime::Builder::new_current_thread()
        .build()
        .unwrap();
    rt.block_on(async {
        preprocess(
            minify(code),
            vec![switch_case()],
            Some("test.svelte".to_string()),
        )
        .await
        .map(|p| minify(&p.code))
        .map_err(|e| e.to_string())
    })
}

fn assert_transpiles(code: &str, expected: &str) {
    let out = run(code).expect("should transpile");
    assert_eq!(out, minify(expected));
}

fn assert_throws(code: &str) {
    assert!(run(code).is_err(), "expected a SyntaxError-equivalent");
}

#[test]
fn preprocessor_has_a_name() {
    assert_eq!(switch_case().name.as_deref(), Some("svelte-switch-case"));
}

#[test]
fn transpiles_a_simple_switch() {
    let code = r#"
    <script>
      let animal = 'dog';
    </script>
    <section>
      {#switch animal}
        {:case "cat"}
          <p>meow</p>
        {:case "dog"}
          <p>woof</p>
        {:default}
          <p>oink?</p>
      {/switch}
    </section>
    "#;
    let expected = r#"
    <script>
      let animal = 'dog';
    </script>
    <section>
      <!-- Injected by svelte-switch-case -->
      {#if animal === "cat"}
        <p>meow</p>
      {:else if animal === "dog"}
        <p>woof</p>
      {:else}
        <p>oink?</p>
      {/if}
    </section>
    "#;
    assert_transpiles(code, expected);
}

#[test]
fn supports_multi_conditions() {
    let code = r#"
      <script>
        let animal = 'dog';
      </script>

      <section>
        Can fly ?
        {#switch animal}
          {:case "cat" || "dog"}
            <p>No</p>
          {:case "bird"}
            <p>Yes</p>
        {/switch}
      </section>
    "#;
    let expected = r#"
      <script>
        let animal = 'dog';
      </script>

      <section>
        Can fly ?
        <!-- Injected by svelte-switch-case -->
        {#if animal === "cat" || animal === "dog"}
          <p>No</p>
        {:else if animal === "bird"}
          <p>Yes</p>
        {/if}
      </section>
    "#;
    assert_transpiles(code, expected);
}

#[test]
fn handles_nested_switch_blocks() {
    let code = r#"
    <script>
      let animal = 'dog';
      let name = 'Max';
    </script>
    <section>
      {#switch animal}
        {:case "cat"}
          <p>meow</p>
        {:case "dog"}
          <p>woof</p>
          {#switch name}
            {:case "Max"}
              <p>Hey Max</p>
            {:case "Bella"}
              <p>Hi Bella</p>
            {:default}
              <p>Hello mysterious dog</p>
          {/switch}
        {:default}
          <p>oink?</p>
      {/switch}
    </section>
    "#;
    let expected = r#"
    <script>
      let animal = 'dog';
      let name = 'Max';
    </script>
    <section>
      <!-- Injected by svelte-switch-case -->
      {#if animal === "cat"}
        <p>meow</p>
      {:else if animal === "dog"}
        <p>woof</p>
        <!-- Injected by svelte-switch-case -->
        {#if name === "Max"}
          <p>Hey Max</p>
          {:else if name === "Bella"}
          <p>Hi Bella</p>
          {:else}
          <p>Hello mysterious dog</p>
        {/if}
        {:else}
          <p>oink?</p>
        {/if}
    </section>
    "#;
    assert_transpiles(code, expected);
}

#[test]
fn ignores_comments() {
    let code = r#"
    <script>
      let animal = 'dog';
    </script>
    <section>
      {#switch animal}
        {:case "cat"}
        <!-- This -->
          <p>meow</p>
          <!-- shouldn't -->
        {:case "dog"}
        <!-- impact -->
          <p>woof</p>
          <!-- the -->
        {:default}
        <!-- parsing -->
          <p>oink?</p>
          <!-- system -->
      {/switch}
    </section>
    "#;
    let expected = r#"
    <script>
      let animal = 'dog';
    </script>
    <section>
      <!-- Injected by svelte-switch-case -->
      {#if animal === "cat"}
      <!-- This -->
        <p>meow</p>
        <!-- shouldn't -->
      {:else if animal === "dog"}
      <!-- impact -->
        <p>woof</p>
        <!-- the -->
      {:else}
      <!-- parsing -->
        <p>oink?</p>
        <!-- system -->
      {/if}
    </section>
    "#;
    assert_transpiles(code, expected);
}

#[test]
fn rejects_two_default_branches() {
    let code = r#"
    <section>
      {#switch animal}
        {:case "cat"}
          <p>meow</p>
        {:case "dog"}
          <p>woof</p>
        {:default}
          <p>oink?</p>
        {:default}
          <p>only one mysterious animal allowed</p>
      {/switch}
    </section>
    "#;
    assert_throws(code);
}

#[test]
fn requires_at_least_one_branch() {
    let code = r#"
    <section>
      {#switch animal}
        <p>I feel lonely here</p>
      {/switch}
    </section>
    "#;
    assert_throws(code);
}

#[test]
fn rejects_content_before_branches() {
    let code = r#"
    <section>
    {#switch animal}
      <p>Will I get detected?</p>
      {:case "cat"}
        <p>meow</p>
      {:case "dog"}
        <p>woof</p>
      {:default}
        <p>oink?</p>
    {/switch}
    </section>
    "#;
    assert_throws(code);
}

#[test]
fn rejects_branches_other_than_case_and_default() {
    let code = r#"
    <section>
    {#switch animal}
      {:case "cat"}
        <p>meow</p>
      {:invalid}
        <p>just chillin between 2 cases</p>
      {:case "dog"}
        <p>woof</p>
      {:default}
        <p>oink?</p>
    {/switch}
    </section>
    "#;
    assert_throws(code);
}
