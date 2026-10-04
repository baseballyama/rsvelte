import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../../..');
const [outputDirectory, oldCheckout] = process.argv.slice(2);
if (!outputDirectory) throw new Error('expected <output-directory> [old-checkout]');
const output = path.resolve(outputDirectory);
fs.mkdirSync(output, { recursive: true });
const cases = path.join(root, 'crates/languages/svelte/lint/tests/fixtures/rsvelte');
const inputs = fs.readdirSync(cases).sort().map(name =>
  path.join(root, 'crates/languages/svelte/compile/tests/fixtures/rsvelte', name, 'input.svelte')
);
for (const input of inputs) if (!fs.statSync(input).isFile()) throw new Error(`missing input: ${input}`);
fs.writeFileSync(path.join(output, 'real.txt'), inputs.join('\n') + '\n');
const large = path.join(output, 'large.svelte');
fs.writeFileSync(large, '<script>const type="button";const props={};</script>\n' +
  '<button id="x" class="control" aria-label="run" type="button"/>\n'.concat(
    '<button {type}/><button {...props}/><button type="submit"/>\n'
  ).repeat(512));
fs.writeFileSync(path.join(output, 'synthetic.txt'), large + '\n');
if (oldCheckout) {
  const checkout = fs.realpathSync(oldCheckout);
  const directory = path.join(output, 'old');
  fs.mkdirSync(path.join(directory, 'src'), { recursive: true });
  fs.copyFileSync(path.join(import.meta.dirname, 'old.rs'), path.join(directory, 'src/main.rs'));
  const manifest = fs.readFileSync(path.join(checkout, 'Cargo.toml'), 'utf8');
  const patches = manifest.slice(manifest.indexOf('[patch.crates-io]'));
  if (!patches.startsWith('[patch.crates-io]')) throw new Error('old checkout has no dependency patches');
  fs.writeFileSync(path.join(directory, 'Cargo.toml'), `
[package]
name = "old-lint-benchmark"
version = "0.0.0"
edition = "2024"
[workspace]
[dependencies]
rsvelte_core = { path = ${JSON.stringify(path.join(checkout, 'crates/rsvelte_core'))}, default-features = false }
rsvelte_lint = { path = ${JSON.stringify(path.join(checkout, 'crates/rsvelte_lint'))}, default-features = false, features = ["native"] }
[profile.release]
debug = "line-tables-only"
lto = "thin"
codegen-units = 1
${patches}`);
}
process.stdout.write(JSON.stringify({ documents: inputs.length, synthetic_documents: 1, output }) + '\n');
