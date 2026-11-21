// Highlights each code block of a page when the page compiles, so the page ships no highlighter.
// A block is `<pre><code class="language-x">`, where x is `sh`, `json` or `js`.

import { createCssVariablesTheme, createHighlighter } from 'shiki';
import { parse, type AST, type PreprocessorGroup } from 'svelte/compiler';

const languages = ['sh', 'json', 'js'];
// The colors are the `--shiki-*` variables in app.css, so the light and dark themes both apply.
const theme = createCssVariablesTheme({ name: 'site', variablePrefix: '--shiki-' });
const highlighter = createHighlighter({
	themes: [theme],
	langs: ['shellscript', 'json', 'javascript'],
});

type Block = { start: number; end: number; language: string; code: string };

// The text of a code element: static text, or one template literal without expressions.
function text(code: AST.RegularElement, file: string): string {
	return code.fragment.nodes
		.map((node) => {
			if (node.type === 'Text') return node.data;
			if (
				node.type === 'ExpressionTag' &&
				node.expression.type === 'TemplateLiteral' &&
				node.expression.expressions.length === 0
			)
				return node.expression.quasis[0]!.value.cooked ?? '';
			throw new Error(`${file}: a code block holds only text or one template literal`);
		})
		.join('');
}

function language(code: AST.RegularElement, file: string): string {
	const attribute = code.attributes.find(
		(a): a is AST.Attribute => a.type === 'Attribute' && a.name === 'class',
	);
	const value = Array.isArray(attribute?.value) ? attribute.value : [];
	const name = value.length === 1 && value[0]!.type === 'Text' ? value[0]!.data : '';
	const found = /^language-(\w+)$/.exec(name)?.[1];
	if (!found || !languages.includes(found))
		throw new Error(`${file}: give each code block a class of language-${languages.join(', ')}`);
	return found;
}

function blocks(source: string, file: string): Block[] {
	const found: Block[] = [];
	function visit(node: unknown) {
		if (typeof node !== 'object' || node === null) return;
		if (Array.isArray(node)) return node.forEach(visit);
		const element = node as AST.RegularElement;
		if (element.type === 'RegularElement' && element.name === 'pre') {
			const children = element.fragment.nodes.filter(
				(child) => child.type !== 'Text' || child.data.trim(),
			);
			const code = children[0];
			if (children.length !== 1 || code?.type !== 'RegularElement' || code.name !== 'code')
				throw new Error(`${file}: a pre element holds one code element`);
			found.push({
				start: element.start,
				end: element.end,
				language: language(code, file),
				code: text(code, file),
			});
			return;
		}
		for (const [key, value] of Object.entries(node))
			if (key !== 'metadata' && key !== 'loc') visit(value);
	}
	visit(parse(source, { modern: true }).fragment);
	return found;
}

export function highlight(): PreprocessorGroup {
	return {
		name: 'highlight',
		async markup({ content, filename = '' }) {
			if (!filename.includes('/src/routes/')) return;
			const found = blocks(content, filename);
			if (!found.length) return;
			const shiki = await highlighter;
			let code = content;
			// From the last block, so the earlier offsets stay valid.
			for (const block of found.toReversed()) {
				const html = shiki
					.codeToHtml(block.code, { lang: block.language, theme: 'site' })
					// Svelte rejects a tabindex on a pre element, which is not interactive.
					.replace(' tabindex="0"', '')
					.replaceAll('{', '&#123;')
					.replaceAll('}', '&#125;');
				code = code.slice(0, block.start) + html + code.slice(block.end);
			}
			return { code };
		},
	};
}
