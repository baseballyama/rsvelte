use rsv_kernel::pipeline::{Document, Registry, RunOptions, Sharing, run};

const CLIENT: &str = "svue.behaviour/client";
const SERVER: &str = "svue.behaviour/server";

/// The module, if any, and the diagnostics' `code: message`s, for one task.
fn compile(src: &str, task: &str) -> (Option<String>, Vec<String>) {
    let mut reg = Registry::new();
    rsv_vue::register(&mut reg, &rsv_vue::Config::default());
    rsv_svue::register(&mut reg);
    let docs = [Document::new("Component.vue".into(), src.into(), "vue").expect("a document")];
    let opts = RunOptions {
        tasks: &[task],
        sharing: Sharing::Isolated,
        threads: None,
    };
    let mut results = run(&reg, &docs, &opts).expect("the task is registered");
    let result = results.pop().expect("one document");
    assert_eq!(result.panic, None, "{task} panicked on\n{src}");
    let (_, out) = result
        .outputs
        .into_iter()
        .find(|(id, _)| *id == task)
        .expect("the task ran");
    let diagnostics: Vec<String> = out
        .diagnostics
        .iter()
        .map(|d| format!("{}: {}", d.code, d.message))
        .collect();
    let module = match out.files.as_slice() {
        [] => None,
        [file] if diagnostics.is_empty() => Some(file.text.clone()),
        _ => panic!("{task}: a module beside diagnostics: {out:?}"),
    };
    (module, diagnostics)
}

fn both(src: &str) -> [String; 2] {
    [CLIENT, SERVER].map(|t| match compile(src, t) {
        (Some(js), _) => js,
        (None, d) => panic!("{t}: {d:?}"),
    })
}

/// The one refusal both targets give.
fn refusal(src: &str) -> String {
    let [client, server] = [CLIENT, SERVER].map(|t| match compile(src, t) {
        (Some(js), _) => panic!("{t} translated:\n{js}"),
        (None, mut d) => {
            assert_eq!(d.len(), 1, "{d:?}");
            d.pop().expect("one")
        }
    });
    assert_eq!(client, server, "the targets refuse alike");
    client
}

fn imports(js: &str) -> Vec<&str> {
    js.lines()
        .filter(|l| l.starts_with("import "))
        .map(|l| {
            let q = l.trim_end_matches(';');
            let q = &q[..q.len() - 1];
            &q[q.rfind(['\'', '"']).expect("a module specifier") + 1..]
        })
        .collect()
}

const COUNTER: &str = r#"<script setup>
import { ref, computed, onMounted } from 'vue'
const count = ref(0)
const double = computed(() => count.value * 2)
const mounted = ref(false)
onMounted(() => { mounted.value = true })
function inc() { count.value++ }
</script>

<template>
  <button @click="inc">{{ count }} / {{ double }}</button>
  <p v-if="mounted">mounted</p>
</template>
"#;

#[test]
fn a_component_translates_to_runes_on_both_targets() {
    let [client, server] = both(COUNTER);
    assert!(client.contains("$.state(0)"), "{client}");
    assert!(client.contains("$.derived("), "{client}");
    assert!(client.contains("onMount("), "{client}");
    assert!(server.contains("$$renderer"), "{server}");
}

#[test]
fn imports_are_svelte_and_vue_only() {
    for js in both(COUNTER) {
        let found = imports(&js);
        assert!(!found.is_empty());
        for m in found {
            assert!(
                m == "svelte" || m.starts_with("svelte/") || m == "vue" || m.starts_with("@vue/"),
                "{m} in\n{js}"
            );
        }
    }
}

#[test]
fn interpolation_goes_through_vue_display_rules() {
    let [client, _] = both(
        "<script setup>\nconst n = null\n</script>\n<template><p>{{ n }}</p><p></p></template>\n",
    );
    assert!(client.contains("toDisplayString"), "{client}");
    assert!(imports(&client).contains(&"vue"), "{client}");
}

#[test]
fn a_boolean_prop_is_cast_as_runtime_core_does() {
    // Two roots: nothing falls through.
    let src = "<script setup>\nconst props = defineProps({ flag: Boolean })\n</script>\n\
               <template><p>{{ String(props.flag) }}</p><p></p></template>\n";
    let [client, server] = both(src);
    for js in [&client, &server] {
        assert!(js.contains("'flag' in"), "{js}");
    }
}

#[test]
fn fallthrough_spreads_and_client_v_model_attaches() {
    let fallthrough = "<script setup>\ndefineProps(['label'])\n</script>\n\
                       <template><span class=\"own\">{{ label }}</span></template>\n";
    let [client, server] = both(fallthrough);
    assert!(
        client.contains("$.attribute_effect(span, ($0) => ({ ...$.get(attrs), class: $0 })"),
        "{client}"
    );
    assert!(
        client.contains("normalizeClass(['own', $.get(attrs).class])"),
        "{client}"
    );
    assert!(
        server.contains("$.attributes({ ...attrs(), class:"),
        "{server}"
    );
    let model = "<script setup>\nimport { ref } from 'vue'\nconst t = ref('a')\n</script>\n\
                 <template><input v-model.trim=\"t\"><p></p></template>\n";
    let [client, server] = both(model);
    assert!(
        client.contains("$.attach(input, () => vmodel(vModelText,"),
        "{client}"
    );
    assert!(client.contains("{ trim: true }"), "{client}");
    assert!(!server.contains("vModelText"), "{server}");
    assert!(server.contains("value"), "{server}");
}

#[test]
fn every_refusal_names_what_is_not_supported() {
    let cases: &[(&str, &str)] = &[
        (
            "<template><p></p><p></p></template>\n<style>p { color: red }</style>\n",
            "`<style>`",
        ),
        (
            "<script setup>\nimport x from './x'\n</script>\n\
             <template><p>{{ x }}</p><p></p></template>\n",
            "an import from a module other than `vue`",
        ),
        (
            "<script setup>\nimport { watch } from 'vue'\nwatch(() => 1, () => {})\n</script>\n\
             <template><p></p><p></p></template>\n",
            "an import from `vue` other than",
        ),
        (
            "<template><p>{{ missing }}</p><p></p></template>\n",
            "`missing`, which the component does not declare",
        ),
        (
            "<script setup>\nimport { ref } from 'vue'\nconst a = ref(1)\nconst b = a\n</script>\n\
             <template><p></p><p></p></template>\n",
            "a ref used other than through `.value`",
        ),
        (
            "<script setup>\nconst xs = [1]\n</script>\n\
             <template><p v-for=\"(a, b, c, d) in xs\">{{ a }}</p><p></p></template>\n",
            "a `v-for` with no alias or more than three",
        ),
        (
            "<script setup>\nfunction f() {}\n</script>\n\
             <template><button @click.once=\"f\"></button><p></p></template>\n",
            "the event modifier `.once`",
        ),
        (
            "<script setup>\ndefineProps({ n: { type: Number, default: () => 1 } })\n</script>\n\
             <template><p>{{ n }}</p><p></p></template>\n",
            "a prop default other than a literal",
        ),
        (
            "<script setup>\nconst props = defineProps(['v'])\n</script>\n\
             <template><input v-model=\"props.v\"><p></p></template>\n",
            "`v-model` on a prop or a computed",
        ),
        (
            "<template><p> a</p><p></p></template>\n",
            "whitespace that Svelte cleans differently from Vue",
        ),
        (
            "<template><p>a <!-- c --> b</p><p></p></template>\n",
            "whitespace that Svelte cleans differently from Vue",
        ),
        (
            "<template><input TYPE=\"text\"><p></p></template>\n",
            "the attribute name `TYPE`",
        ),
        (
            "<script setup>\nconst xs = [1]\n</script>\n\
             <template><p v-for=\"x in xs\" v-if=\"x\">{{ x }}</p><p></p></template>\n",
            "`v-if` and `v-for` on one element",
        ),
        (
            "<script setup>\nexport const a = 1\n</script>\n<template><p></p><p></p></template>\n",
            "an export from `<script setup>`",
        ),
        (
            "<script setup>\nconst props = defineProps(['onClick'])\n</script>\n\
             <template><p></p><p></p></template>\n",
            "the prop name `onClick`",
        ),
    ];
    // Every case has two roots, so that the fallthrough spread does not show in the output.
    for (src, want) in cases {
        let got = refusal(src);
        assert!(
            got.starts_with("compile_unsupported: not supported by svue: ") && got.contains(want),
            "{src}\nwant {want}\ngot  {got}"
        );
    }
}

#[test]
fn malformed_and_unusual_input_never_panics() {
    for src in [
        "",
        "<template>",
        "<template><p>{{</p></template>",
        "<script setup>\nconst = \n</script>",
        "<template><p v-for=\"(a, b, c, d) in 5\">{{ a }}</p></template>",
        "<template><p v-else>x</p></template>",
        "<template><template v-if=\"true\"><p>a</p></template></template>",
        "<script setup>\nawait 1\n</script>\n<template><p></p><p></p></template>",
        "<template><p :class=\"[{ a: true }, 'b']\" class=\"c\">x</p></template>",
    ] {
        for task in [CLIENT, SERVER] {
            drop(compile(src, task));
        }
    }
}
