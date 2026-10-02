use super::*;

fn refusal(script: &str, template: &str) -> Option<&'static str> {
    let source_text =
        format!("<script setup>\n{script}\n</script>\n<template>{template}</template>\n");
    let c = rsvelte_vue::parse::parse(&source_text).expect("parses");
    let compiler_syntax_tree = rsvelte_vue::compiler_syntax_tree::lower(&c, &source_text);
    let res = rsvelte_vue::resolve::resolve(
        &c.javascript,
        c.program,
        compiler_syntax_tree.as_ref(),
        &source_text,
    );
    let input =
        CompileInput::from_single_file_component(&c, compiler_syntax_tree.as_ref(), &source_text);
    compile(&input, &res, "a.vue").err().map(|u| u.what)
}

fn output(script: &str, template: &str) -> String {
    let source_text =
        format!("<script setup>\n{script}\n</script>\n<template>{template}</template>\n");
    let c = rsvelte_vue::parse::parse(&source_text).expect("parses");
    let compiler_syntax_tree = rsvelte_vue::compiler_syntax_tree::lower(&c, &source_text);
    let res = rsvelte_vue::resolve::resolve(
        &c.javascript,
        c.program,
        compiler_syntax_tree.as_ref(),
        &source_text,
    );
    let input =
        CompileInput::from_single_file_component(&c, compiler_syntax_tree.as_ref(), &source_text);
    compile(&input, &res, "a.vue").expect("compiles").javascript
}

// Expected fragments from @vue/compiler-sfc 3.5.43's compileScript (inlineTemplate) on the
// same input, reprinted.
#[test]
fn define_options_merges_into_the_component_object() {
    let javascript = output(
        "defineOptions({ inheritAttrs: false, name: 'X' })\nconst k = 'a'\n\
         defineProps({ a: {} })",
        "<p>{{ a }}</p>",
    );
    assert!(
        javascript.contains(
            "const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false, name: \
             'X' }, { __name: 'a', props: { a: {} }, setup(__props) {"
        ),
        "{javascript}"
    );
    assert!(!javascript.contains("defineOptions"), "{javascript}");
    let javascript = output("defineOptions()", "<p></p>");
    assert!(
        javascript.contains("const _sfc_main = { __name: 'a', setup(__props) {"),
        "{javascript}"
    );
    let javascript = output("const k = 'a'\ndefineOptions({ name: k })", "<p></p>");
    assert!(
        javascript.contains("Object.assign({ name: k }, {"),
        "{javascript}"
    );
}

#[test]
fn define_options_refuses_what_upstream_rejects() {
    for (script, want) in [
        (
            "defineOptions({ props: {} })",
            "a defineOptions() key that has a macro of its own",
        ),
        (
            "defineOptions({})\ndefineOptions({})",
            "a duplicate defineOptions() call",
        ),
        (
            "defineOptions({ a: 1 })\ndefineOptions()",
            "a duplicate defineOptions() call",
        ),
        (
            "import { ref } from 'vue'\nconst k = ref(1)\ndefineOptions({ name: k })",
            "defineOptions() referencing a binding of <script setup>",
        ),
        ("const x = defineOptions({})", "this compiler macro"),
    ] {
        assert_eq!(refusal(script, "<p></p>"), Some(want), "{script}");
    }
}

#[test]
fn a_function_ref_patches_and_marks_v_for() {
    let javascript = output(
        "import { ref } from 'vue'\nconst n = ref(0)",
        "<p :ref=\"(el) => (n = el)\">{{ n }}</p>\
         <ul><li v-for=\"i in 3\" :key=\"i\" :ref=\"(el) => n = el\">{{ i }}</li></ul>",
    );
    assert!(
        javascript.contains(
            "_createElementVNode('p', { ref: (el) => n.value = el }, \
             _toDisplayString(n.value), 513)"
        ),
        "{javascript}"
    );
    assert!(
        javascript.contains(
            "_createElementVNode('li', { key: i, ref_for: true, ref: (el) => n.value = el }, \
             _toDisplayString(i), 1)"
        ),
        "{javascript}"
    );
}

#[test]
fn pre_compiles_with_its_text_as_the_compiler_syntax_tree_holds_it() {
    let javascript = output("const s = 'a'", "<pre>  {{ s }}\n x</pre>");
    assert!(
        javascript
            .contains("_createElementBlock('pre', null, '  ' + _toDisplayString(s) + '\\n x')"),
        "{javascript}"
    );
}

#[test]
fn two_structural_directives_of_one_kind_are_refused() {
    let want = Some("two structural directives of one kind");
    for t in [
        "<p v-if=\"a\" v-if=\"b\">x</p>",
        "<p v-if=\"a\">x</p><p v-else-if=\"a\" v-else>y</p>",
        "<p v-for=\"i in 2\" v-for=\"j in 2\">x</p>",
    ] {
        assert_eq!(refusal("const a = 1, b = 2", t), want, "{t}");
    }
    assert_eq!(
        refusal("const a = 1", "<p v-if=\"a\" v-for=\"i in 2\">x</p>"),
        None
    );
}

const REFS: &str = "import { ref, reactive } from 'vue'\nconst r = ref('')\n\
                    const s = reactive({ a: '' })\nlet l = ''\nconst k = 'x'";

#[test]
fn v_model_compiles_on_a_ref_or_a_member_of_a_form_element() {
    for t in [
        "<input v-model=\"r\">",
        "<input v-model.trim.number=\"s.a\">",
        "<input type=\"checkbox\" v-model=\"r\">",
        "<input type=\"radio\" value=\"a\" v-model=\"r\">",
        "<textarea v-model=\"r\"></textarea>",
        "<select v-model=\"r\"></select>",
    ] {
        assert_eq!(refusal(REFS, t), None, "{t}");
    }
}

#[test]
fn v_model_refuses_what_upstream_rejects_or_the_port_does_not_compile() {
    let target = Some("a v-model target that is not a ref or a member expression");
    for (t, want) in [
        ("<input v-model=\"l\">", target),
        ("<input v-model=\"k\">", target),
        ("<input v-model=\"s\">", target),
        ("<input v-model=\"r + 1\">", target),
        ("<div v-model=\"r\"></div>", Some("v-model on this element")),
        (
            "<input v-model:x=\"r\">",
            Some("a v-model argument on an element"),
        ),
        (
            "<input :value=\"k\" v-model=\"r\">",
            Some("v-model with a bound `value`"),
        ),
        (
            "<input :type=\"k\" v-model=\"r\">",
            Some("v-model with a bound `type`"),
        ),
        (
            "<input type=\"file\" v-model=\"r\">",
            Some("v-model on a file input"),
        ),
        (
            "<textarea v-model=\"r\"> </textarea>",
            Some("this element in a compiled template"),
        ),
    ] {
        assert_eq!(refusal(REFS, t), want, "{t}");
    }
}
