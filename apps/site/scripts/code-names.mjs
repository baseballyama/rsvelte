import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { rustDeclarations } from './rust-declarations.mjs';
import typescript from 'typescript';
import { parse } from 'svelte/compiler';

export const abbreviations = new Map(Object.entries({
	db: 'database', ctx: 'context', idx: 'index', loc: 'location', diag: 'diagnostic',
	ast: 'syntax_tree', hir: 'compiler_syntax_tree', rsv: 'rsvelte',
	src: 'source', buf: 'buffer', pos: 'position', opts: 'options',
	cmd: 'command', cmds: 'commands', stmt: 'statement', stmts: 'statements',
	expr: 'expression', exprs: 'expressions', decl: 'declaration', decls: 'declarations',
	attr: 'attribute', attrs: 'attributes', params: 'parameters', vars: 'variables',
	tmp: 'temporary', rem: 'remaining', tok: 'token', toks: 'tokens',
	cx: 'context', allocs: 'allocations', js: 'javascript', ts: 'typescript',
	css: 'stylesheet', html: 'markup', dsl: 'layout_expression',
	lo: 'start_offset', hi: 'end_offset'
}));

export function nameFindings(name) {
	return name.replace(/([a-z\d])([A-Z])/g, '$1_$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1_$2').toLowerCase()
		.split(/[^a-z\d]+/).filter(part => abbreviations.has(part));
}

// Only declarations are checked, so names that std or a dependency declares are never reported.
export function sourceFindings(source, { traitParameterNamesEnforced = false, upstreamNames = new Set() } = {}) {
	const findings = [];
	for (const { name, line, owner } of rustDeclarations(source, { traitParameterNamesEnforced })) {
		const qualified = owner ? `${owner}::${name}` : name;
		if (upstreamNames.has(qualified)) continue;
		for (const abbreviation of nameFindings(name)) findings.push({ name, qualified, abbreviation, line });
	}
	return findings;
}

/** Each kept Rust name must copy a public Svelte name, and the installed Svelte types must still contain it. */
export function upstreamNames(entries, svelteTypes) {
	const byFile = new Map();
	for (const entry of entries) {
		if (!svelteTypes.includes(entry.upstream)) throw new Error(`${entry.file}: ${entry.name}: Svelte types no longer contain ${JSON.stringify(entry.upstream)}`);
		if (!byFile.has(entry.file)) byFile.set(entry.file, new Set());
		byFile.get(entry.file).add(entry.name);
	}
	return byFile;
}

// The workspace lint keeps a trait implementation's parameter names equal to the trait's declaration.
export function traitParameterNamesEnforced(manifest, clippyConfiguration) {
	return /^renamed_function_params\s*=\s*"deny"/m.test(manifest) && !/allow-renamed-params-for/.test(clippyConfiguration);
}

// The one std `Write::write` implementation whose `buf` the workspace lint keeps.
export const WRITE_BUFFER_FILE = 'hosts/config/src/wire.rs';

/** True when `source` declares `buf` only because it implements std `Write::write` under the lint. */
export function keepsWriteBuffer(source) {
	const keptOff = sourceFindings(source).filter(finding => finding.name === 'buf').length;
	const keptOn = sourceFindings(source, { traitParameterNamesEnforced: true }).filter(finding => finding.name === 'buf').length;
	return keptOn < keptOff;
}

// `crates/languages/<language>/` is named after the language (crates/README.md); these are the language names.
const LANGUAGE_DIRECTORIES = new Set(['css', 'html']);

export function pathFindings(file) {
	const language = file.match(/^languages\/([^/]+)\//)?.[1];
	const rest = LANGUAGE_DIRECTORIES.has(language) ? file.replace(`languages/${language}/`, 'languages/') : file;
	return nameFindings(rest.replaceAll('/src/', '/source/'));
}

// Crate names are declared in the manifest; Rust files only use them.
export function manifestFindings(manifest) {
	const findings = [];
	for (const match of manifest.matchAll(/^\[(?:package|lib)\][^[]*?^name\s*=\s*"([^"]+)"/gms)) {
		const name = match[1].replaceAll('-', '_');
		const line = manifest.slice(0, match.index + match[0].length).split('\n').length;
		for (const abbreviation of nameFindings(name)) findings.push({ name, abbreviation, line });
	}
	return findings;
}

export function checkCodeNames(root) {
	const errors = [];
	let files = 0;
	const require = createRequire(import.meta.url);
	const svelteTypes = readFileSync(path.join(path.dirname(require.resolve('svelte/package.json')), 'types/index.d.ts'), 'utf8');
	const kept = upstreamNames(JSON.parse(readFileSync(new URL('./upstream-names.json', import.meta.url), 'utf8')), svelteTypes);
	const read = file => existsSync(path.join(root, file)) ? readFileSync(path.join(root, file), 'utf8') : '';
	const enforced = traitParameterNamesEnforced(read('Cargo.toml'), read('clippy.toml'));
	const used = new Set();
	for (const file of readdirSync(path.join(root, 'crates'), { recursive: true, encoding: 'utf8' })) {
		if (!file.endsWith('.rs') && !file.endsWith('Cargo.toml')) continue;
		// Cargo's conventional source directory is not a project-defined module name.
		for (const abbreviation of pathFindings(file)) errors.push(`${file}: abbreviated path component ${abbreviation}`);
		const text = readFileSync(path.join(root, 'crates', file), 'utf8');
		if (file.endsWith('.rs')) {
			files++;
			const names = kept.get(file) ?? new Set();
			for (const { name, owner } of rustDeclarations(text)) {
				const qualified = owner ? `${owner}::${name}` : name;
				if (names.has(qualified)) used.add(`${file}\0${qualified}`);
			}
		}
		const findings = file.endsWith('.rs')
			? sourceFindings(text, { traitParameterNamesEnforced: enforced && file === WRITE_BUFFER_FILE, upstreamNames: kept.get(file) })
			: manifestFindings(text);
		for (const finding of findings) {
			errors.push(`${file}:${finding.line}: ${finding.name}: use ${abbreviations.get(finding.abbreviation)}`);
		}
	}
	if (!files) throw new Error('No Rust source files were checked');
	if (enforced && !keepsWriteBuffer(read(path.join('crates', WRITE_BUFFER_FILE)))) {
		errors.push(`${WRITE_BUFFER_FILE}: no std Write::write with a buf parameter is declared there`);
	}
	for (const [file, names] of kept) for (const name of names) {
		if (!used.has(`${file}\0${name}`)) errors.push(`scripts/upstream-names.json: ${file}: ${name} is not declared there`);
	}
	const siteSource = path.join(root, 'apps/site/src');
	for (const file of readdirSync(siteSource, { recursive: true, encoding: 'utf8' })) {
		if (!/\.(ts|svelte)$/.test(file) || file.includes('/wasm/')) continue;
		files++;
		for (const finding of scriptFindings(readFileSync(path.join(siteSource, file), 'utf8'), file)) {
			errors.push(`apps/site/src/${file}:${finding.line}: ${finding.name}: use ${abbreviations.get(finding.abbreviation)}`);
		}
	}
	return { files, errors };
}

export function scriptFindings(source, filename) {
	const component = filename.endsWith('.svelte') ? parse(source, { modern: true }) : null;
	const scripts = component
		? [component.instance, component.module]
			.filter(Boolean).map(script => ({ text: source.slice(script.content.start, script.content.end), offset: script.content.start }))
		: [{ text: source, offset: 0 }];
	const findings = [];
	for (const script of scripts) {
		const tree = typescript.createSourceFile(filename + '.ts', script.text, typescript.ScriptTarget.Latest, true);
		const firstLine = source.slice(0, script.offset).split('\n').length;
		const visit = node => {
			if (typescript.isIdentifier(node) && node.parent.name === node
				&& !typescript.isPropertyAccessExpression(node.parent)
				&& !(typescript.isImportSpecifier(node.parent) && !node.parent.propertyName)) {
				for (const abbreviation of nameFindings(node.text)) findings.push({
					name: node.text, abbreviation,
					line: firstLine + tree.getLineAndCharacterOfPosition(node.getStart(tree)).line
				});
			}
			typescript.forEachChild(node, visit);
		};
		visit(tree);
	}
	return findings;
}
