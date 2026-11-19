use oxc_span::SourceType;
use rsvelte_kernel::computation::file_facts::FileFacts;
use rsvelte_kernel::source::document::Document;
use rsvelte_typescript_tree::Tree;

use super::{KitFile, hooks_module, inserted, inserted_finding, kit_file};

/// What `inserted` adds to `source`, a TypeScript module at `name`, with `hooks` as the hook types'
/// module. Each case's expected value is svelte2tsx 0.7.63's `upsertKitFile` (`addedCode`).
fn annotations(name: &str, source: &str, hooks: &str) -> Vec<(u32, String)> {
    let document = Document::new(name.to_owned(), source.to_owned()).expect("small");
    let (tree, root) = Tree::program(&document, SourceType::ts()).expect("the case parses");
    let kind = kit_file(name).expect("a kit file");
    inserted(tree.get_program(root), kind, super::basename(name), hooks)
}

fn expected(added: &[(u32, &str)]) -> Vec<(u32, String)> {
    added.iter().map(|&(at, s)| (at, s.to_owned())).collect()
}

const KIT_3: &str = "@sveltejs/kit/hooks";

/// Upstream writes an arrow's return type before its `=>`; the tree has no token there, so it
/// goes right after the parameters, which TypeScript reads the same way.
#[test]
fn server_hooks_in_arrow_function_expression_and_declaration_forms() {
    let source = concat!(
        "export const handleFetch = async ({ request, fetch, event }) => {\n",
        "  return fetch(request);\n};\n",
        "export const handle = async ({ event, resolve }) => resolve(event);\n",
        "export const handleError = function ({ error, status }) {\n",
        "  console.log(error, status);\n};\n",
    );
    assert_eq!(
        annotations("/x/src/hooks.server.ts", source, KIT_3),
        expected(&[
            (
                59,
                ": Parameters<import('@sveltejs/kit/hooks').HandleFetch>[0]"
            ),
            // Upstream: 61, the `=>`.
            (
                60,
                ": ReturnType<import('@sveltejs/kit/hooks').HandleFetch> "
            ),
            (141, ": Parameters<import('@sveltejs/kit/hooks').Handle>[0]"),
            // Upstream: 143.
            (142, ": ReturnType<import('@sveltejs/kit/hooks').Handle> "),
            (
                216,
                ": Parameters<import('@sveltejs/kit/hooks').HandleServerError>[0]"
            ),
            (
                218,
                ": ReturnType<import('@sveltejs/kit/hooks').HandleServerError> "
            ),
        ])
    );
    let declarations = concat!(
        "export async function handle({ event, resolve }) {\n  return resolve(event);\n}\n",
        "export function handleError(input: any) {}\n",
        "export const handleFetch: Foo = (x) => x;\n",
    );
    assert_eq!(
        annotations("/x/src/hooks.server.ts", declarations, KIT_3),
        expected(&[
            (47, ": Parameters<import('@sveltejs/kit/hooks').Handle>[0]"),
            (49, ": ReturnType<import('@sveltejs/kit/hooks').Handle> "),
        ])
    );
}

#[test]
fn client_and_universal_hooks_and_matchers() {
    assert_eq!(
        annotations(
            "/x/src/hooks.client.ts",
            "export const handleError = (e) => {};\n",
            "@sveltejs/kit"
        ),
        expected(&[
            (
                29,
                ": Parameters<import('@sveltejs/kit').HandleClientError>[0]"
            ),
            // Upstream: 31.
            (
                30,
                ": ReturnType<import('@sveltejs/kit').HandleClientError> "
            ),
        ])
    );
    let reroute = "export function reroute(e) { return '/'; }\n";
    for name in ["/x/src/hooks.ts", "/x/src/hooks/index.ts"] {
        assert_eq!(
            annotations(name, reroute, "@sveltejs/kit"),
            expected(&[
                (25, ": Parameters<import('@sveltejs/kit').Reroute>[0]"),
                (27, ": ReturnType<import('@sveltejs/kit').Reroute> "),
            ]),
            "{name}"
        );
    }
    assert_eq!(
        annotations(
            "/x/src/params/fruit.ts",
            "export function match(param) {\n  return param === 'apple';\n}\n",
            "@sveltejs/kit"
        ),
        expected(&[(27, ": string"), (29, ": boolean ")])
    );
}

#[test]
fn a_page_s_load_options_and_entries() {
    let source = concat!(
        "export const load = async ({ fetch }) => {\n  return {};\n};\n",
        "export const prerender = true;\n",
        "export const ssr = false, csr = true;\n",
        "export let trailingSlash = 'always';\n",
        "export const entries = () => [];\n",
    );
    assert_eq!(
        annotations("/x/src/routes/+page.ts", source, KIT_3),
        expected(&[
            (36, ": import('./$types.js').PageLoadEvent"),
            (81, " : boolean | 'auto'"),
            (152, " : 'never' | 'always' | 'ignore'"),
            // Upstream: 191.
            (190, ": ReturnType<import('./$types.js').EntryGenerator> "),
        ])
    );
    let layout = concat!(
        "export function load(event) {\n  return {};\n}\n",
        "export const csr: boolean = true;\n",
        "export function entries() { return []; }\n",
    );
    assert_eq!(
        annotations("/x/src/routes/+layout.server.ts", layout, KIT_3),
        expected(&[(26, ": import('./$types.js').LayoutServerLoadEvent")])
    );
    assert_eq!(
        annotations(
            "/x/src/routes/+page@.ts",
            "export const load = (e) => ({});\n",
            KIT_3
        ),
        expected(&[(22, ": import('./$types.js').PageLoadEvent")])
    );
}

#[test]
fn a_load_that_is_no_function_satisfies_its_type_and_actions_theirs() {
    let source = concat!(
        "export const load = makeLoad();\n",
        "export const actions = {\n  default: async ({ request }) => {}\n};\n",
    );
    assert_eq!(
        annotations("/x/src/routes/+page.server.ts", source, KIT_3),
        expected(&[
            (20, "("),
            (30, ") satisfies import('./$types.js').PageServerLoad"),
            (95, " satisfies import('./$types.js').Actions"),
        ])
    );
}

#[test]
fn request_handlers_return_a_response_or_its_promise() {
    let source = concat!(
        "export async function GET({ url }) {\n  return new Response();\n}\n",
        "export const POST = (event) => new Response();\n",
        "export function PUT(this: any, e) {}\n",
        "export const fallback = async (e) => new Response();\n",
    );
    assert_eq!(
        annotations("/x/src/routes/a/+server.ts", source, KIT_3),
        expected(&[
            (33, ": import('./$types.js').RequestEvent"),
            (35, ": Promise<Response> "),
            (90, ": import('./$types.js').RequestEvent"),
            // Upstream: 92.
            (91, ": Response | Promise<Response> "),
            (180, ": import('./$types.js').RequestEvent"),
            // Upstream: 182.
            (181, ": Promise<Response> "),
        ])
    );
}

#[test]
fn typed_exports_overloads_and_odd_parameters() {
    let typed = concat!(
        "export const load = ((e) => ({})) satisfies PageLoad;\n",
        "export const ssr = (true);\n",
    );
    assert_eq!(
        annotations("/x/src/routes/+page.ts", typed, KIT_3),
        expected(&[(70, " : boolean")])
    );
    // The last declaration of a name counts, a default export by its name too.
    let overloads = concat!(
        "export default function load(e) {}\n",
        "export function load(e: X): Y;\n",
        "export function load(e) {}\n",
        "export declare const prerender: boolean;\n",
    );
    assert_eq!(
        annotations("/x/src/routes/+page.ts", overloads, KIT_3),
        expected(&[(88, ": import('./$types.js').PageLoadEvent")])
    );
    let odd = concat!(
        "export const load = x => x;\n",
        "export const entries = async function* () {};\n",
    );
    assert_eq!(
        annotations("/x/src/routes/+page.ts", odd, KIT_3),
        expected(&[
            (21, ": import('./$types.js').PageLoadEvent"),
            (70, ": ReturnType<import('./$types.js').EntryGenerator> "),
        ])
    );
    let defaults = concat!(
        "export const load = ({ a } = {}) => a;\n",
        "export const GET = (...args) => 1;\n",
    );
    assert_eq!(
        annotations("/x/src/routes/+page.ts", defaults, KIT_3),
        expected(&[
            (31, ": import('./$types.js').PageLoadEvent"),
            (66, ": import('./$types.js').RequestEvent"),
            // Upstream: 68.
            (67, ": Response | Promise<Response> "),
        ])
    );
}

#[test]
fn kit_files_are_known_by_name() {
    let kinds = [
        ("/x/src/routes/+page.ts", Some(KitFile::Route)),
        ("/x/lib/+layout.server.ts", Some(KitFile::Route)),
        ("/x/src/routes/+server.ts", Some(KitFile::Route)),
        ("/x/src/routes/+page@group.ts", Some(KitFile::Route)),
        ("/x/src/routes/+page.svelte.ts", None),
        ("/x/src/routes/+page.js", None),
        ("/x/src/routes/+error.ts", None),
        ("/x/src/hooks.server.ts", Some(KitFile::ServerHooks)),
        ("/x/src/hooks.server/index.ts", Some(KitFile::ServerHooks)),
        ("/x/src/hooks.client.ts", Some(KitFile::ClientHooks)),
        ("/x/src/hooks.ts", Some(KitFile::UniversalHooks)),
        ("src/hooks.ts", Some(KitFile::UniversalHooks)),
        ("/x/src/hooks.d.ts", None),
        ("/x/src/params/fruit.ts", Some(KitFile::Params)),
        ("/x/src/params/fruit.test.ts", None),
        ("/x/src/params/fruit.spec.ts", None),
        ("/x/src/params/a/b.ts", None),
        ("/x/src/lib/hooks.ts", None),
        ("index.ts", None),
        ("+page.ts", Some(KitFile::Route)),
    ];
    for (name, kind) in kinds {
        assert_eq!(kit_file(name), kind, "{name}");
    }
}

#[test]
fn the_hook_types_come_from_the_kit_the_file_resolves() {
    let root = std::env::temp_dir().join(format!("rsvelte-kit-files-{}", std::process::id()));
    let kit = |directory: &str, manifest: &str| {
        let kit = root.join(directory).join("node_modules/@sveltejs/kit");
        std::fs::create_dir_all(&kit).expect("test directory");
        std::fs::write(kit.join("package.json"), manifest).expect("test file");
    };
    kit("", r#"{"version":"3.1.1"}"#);
    kit("two", r#"{"version":"2.20.0"}"#);
    kit("broken", "{");
    let files = FileFacts::default();
    let module = |file: &str| hooks_module(&files, &root.join(file));
    assert_eq!(module("src/hooks.server.ts"), "@sveltejs/kit/hooks");
    assert_eq!(module("two/src/hooks.server.ts"), "@sveltejs/kit");
    assert_eq!(module("broken/src/hooks.server.ts"), "@sveltejs/kit");
    drop(std::fs::remove_dir_all(&root));
    assert_eq!(
        hooks_module(&FileFacts::default(), &root.join("src/hooks.ts")),
        "@sveltejs/kit"
    );
}

#[test]
fn only_a_missing_type_and_a_missing_return_are_reported_in_an_annotation() {
    let missing = "Cannot find module './$types.js' or its corresponding type declarations.";
    assert_eq!(
        inserted_finding(2307, missing.to_owned()).as_deref(),
        Some(
            "Cannot find module './$types.js' or its corresponding type declarations. (this \
             likely means that SvelteKit's type generation didn't run yet - try running it by \
             executing 'npm run dev' or 'npm run build')"
        )
    );
    let kit = "Cannot find module '@sveltejs/kit' or its corresponding type declarations.";
    assert_eq!(inserted_finding(2307, kit.to_owned()).as_deref(), Some(kit));
    let member =
        "Namespace '\"/x/.svelte-kit/types/src/routes/$types\"' has no exported member 'PageLoad'.";
    assert!(
        inserted_finding(2694, member.to_owned())
            .is_some_and(|message| message.ends_with("executing 'npm run dev' or 'npm run build')"))
    );
    assert!(inserted_finding(2355, "A function...".to_owned()).is_some());
    assert_eq!(inserted_finding(2322, "Type...".to_owned()), None);
}
