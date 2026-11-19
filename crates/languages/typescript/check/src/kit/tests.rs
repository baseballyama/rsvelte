use std::path::Path;

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;

use super::insertions;

/// `source` with what svelte2tsx inserts into `file`.
fn upserted(file: &str, source: &str, hooks_module: &'static str) -> String {
    let allocator = Allocator::default();
    let program = Parser::new(&allocator, source, SourceType::ts())
        .parse()
        .program;
    let mut out = String::new();
    let mut from = 0;
    for insertion in insertions(Path::new(file), source, &program, || hooks_module) {
        out.push_str(&source[from..insertion.at as usize]);
        out.push_str(&insertion.text);
        from = insertion.at as usize;
    }
    out.push_str(&source[from..]);
    out
}

/// Each file, its text, and what svelte2tsx 0.7.61's `upsertKitFile` makes of it.
const CASES: &[(&str, &str, &str)] = &[
    (
        "/p/src/routes/+layout.ts",
        "export const load = async ({ parent }) => {\n  return parent();\n};\n",
        "export const load = async ({ parent }: import('./$types.js').LayoutLoadEvent) => {\n  return parent();\n};\n",
    ),
    (
        "/p/src/routes/+page.ts",
        "export async function load(event) {\n  return {};\n}\nexport const prerender = true;\nexport const ssr = false, csr = true;\nexport function entries() {\n  return [];\n}\n",
        "export async function load(event: import('./$types.js').PageLoadEvent) {\n  return {};\n}\nexport const prerender : boolean | 'auto' = true;\nexport const ssr = false, csr = true;\nexport function entries() : ReturnType<import('./$types.js').EntryGenerator> {\n  return [];\n}\n",
    ),
    (
        "/p/src/routes/a/+page.server.ts",
        "export const load = (async (e) => ({})) satisfies X;\nexport const actions = {\n  default: async () => {}\n};\nexport const trailingSlash = 'always';\n",
        "export const load = (async (e) => ({})) satisfies X;\nexport const actions = {\n  default: async () => {}\n} satisfies import('./$types.js').Actions;\nexport const trailingSlash : 'never' | 'always' | 'ignore' = 'always';\n",
    ),
    (
        "/p/src/routes/api/+server.ts",
        "export async function GET(event) {\n  return new Response();\n}\nexport const POST = (event) => new Response();\nexport const PUT = async (event) /* => */ => new Response();\nexport function DELETE(event: any) {}\n",
        "export async function GET(event: import('./$types.js').RequestEvent) : Promise<Response> {\n  return new Response();\n}\nexport const POST = (event: import('./$types.js').RequestEvent) : Response | Promise<Response> => new Response();\nexport const PUT = async (event: import('./$types.js').RequestEvent) /* => */ : Promise<Response> => new Response();\nexport function DELETE(event: any) {}\n",
    ),
    (
        "/p/src/routes/b/+layout.server.ts",
        "export const load = function (e) { return {}; };\nexport const entries = () => [];\n",
        "export const load = function (e: import('./$types.js').LayoutServerLoadEvent) { return {}; };\nexport const entries = () => [];\n",
    ),
    (
        "/p/src/routes/c/+page@foo.ts",
        "export function load(event) {}\n",
        "export function load(event: import('./$types.js').PageLoadEvent) {}\n",
    ),
    (
        "/p/src/hooks.server.ts",
        "export async function handle({ event, resolve }) {\n  return resolve(event);\n}\nexport const handleError = ({ error }) => {};\n",
        "export async function handle({ event, resolve }: Parameters<import('@sveltejs/kit').Handle>[0]) : ReturnType<import('@sveltejs/kit').Handle> {\n  return resolve(event);\n}\nexport const handleError = ({ error }: Parameters<import('@sveltejs/kit').HandleServerError>[0]) : ReturnType<import('@sveltejs/kit').HandleServerError> => {};\n",
    ),
    (
        "/p/src/hooks.client.ts",
        "export const handleError = ({ error }) => {};\n",
        "export const handleError = ({ error }: Parameters<import('@sveltejs/kit').HandleClientError>[0]) : ReturnType<import('@sveltejs/kit').HandleClientError> => {};\n",
    ),
    (
        "/p/src/hooks.ts",
        "export const reroute = ({ url }) => url.pathname;\n",
        "export const reroute = ({ url }: Parameters<import('@sveltejs/kit').Reroute>[0]) : ReturnType<import('@sveltejs/kit').Reroute> => url.pathname;\n",
    ),
    (
        "/p/src/params/id.ts",
        "export function match(param) {\n  return /^\\d+$/.test(param);\n}\n",
        "export function match(param: string) : boolean {\n  return /^\\d+$/.test(param);\n}\n",
    ),
    (
        "/p/src/params/id.test.ts",
        "export function match(param) {}\n",
        "export function match(param) {}\n",
    ),
    (
        "/p/src/lib/x.ts",
        "export const load = async (e) => e;\n",
        "export const load = async (e) => e;\n",
    ),
    (
        "/p/src/routes/d/+page.ts",
        "export const load = async (e: any) => e;\nexport let load2 = 1;\nexport const prerender: boolean = true;\n",
        "export const load = async (e: any) => e;\nexport let load2 = 1;\nexport const prerender: boolean = true;\n",
    ),
];

#[test]
fn the_types_are_inserted_where_svelte2tsx_inserts_them() {
    for &(file, source, expected) in CASES {
        assert_eq!(upserted(file, source, "@sveltejs/kit"), expected, "{file}");
    }
}

#[test]
fn sveltekit_3_declares_the_hook_types_in_its_hooks_module() {
    let source = "export const reroute = ({ url }) => url.pathname;\n";
    assert_eq!(
        upserted("/p/src/hooks.ts", source, "@sveltejs/kit/hooks"),
        "export const reroute = ({ url }: Parameters<import('@sveltejs/kit/hooks').Reroute>[0]) \
         : ReturnType<import('@sveltejs/kit/hooks').Reroute> => url.pathname;\n"
    );
}
