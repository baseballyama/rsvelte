import { readdirSync, readFileSync } from 'node:fs';
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
export function sourceFindings(source) {
	const findings = [];
	for (const { name, line } of rustDeclarations(source)) {
		for (const abbreviation of nameFindings(name)) findings.push({ name, abbreviation, line });
	}
	return findings;
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
	for (const file of readdirSync(path.join(root, 'crates'), { recursive: true, encoding: 'utf8' })) {
		if (!file.endsWith('.rs') && !file.endsWith('Cargo.toml')) continue;
		// Cargo's conventional source directory is not a project-defined module name.
		for (const abbreviation of nameFindings(file.replaceAll('/src/', '/source/'))) errors.push(`${file}: abbreviated path component ${abbreviation}`);
		const findings = file.endsWith('.rs') ? sourceFindings : manifestFindings;
		if (file.endsWith('.rs')) files++;
		for (const finding of findings(readFileSync(path.join(root, 'crates', file), 'utf8'))) {
			errors.push(`${file}:${finding.line}: ${finding.name}: use ${abbreviations.get(finding.abbreviation)}`);
		}
	}
	if (!files) throw new Error('No Rust source files were checked');
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
