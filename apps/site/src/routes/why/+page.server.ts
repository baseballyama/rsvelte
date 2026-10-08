import { createHighlighter, createCssVariablesTheme as createStylesheetVariablesTheme } from 'shiki';
import { bilingual, langOf } from '$lib/i18n';
import { pipelineExamples } from '$lib/widgets/svelte-pipeline';

const highlighter = createHighlighter({
	themes: [createStylesheetVariablesTheme({ name: 'rsvelte', variablePrefix: '--shiki-', fontStyle: true })],
	langs: ['svelte', 'typescript', 'javascript', 'text']
});

const script = '<script>\n  let name = $state("");\n</script>';
const stylesheet = '<style>\n  .greeting { color: navy; }\n</style>';
const examples = bilingual({
	script,
	template: '<input bind:value={name} />\n<p class="greeting">\n  こんにちは、{name}\n</p>',
	stylesheet
}, {
	script,
	template: '<input bind:value={name} />\n<p class="greeting">\n  Hello, {name}\n</p>',
	stylesheet
});

export const load = async ({ url }) => {
	const syntax = await highlighter;
	const lang = langOf(url.pathname);
	return {
		pipeline: Object.fromEntries(Object.entries(pipelineExamples[lang]).map(([identifier, example]) => [identifier,
			syntax.codeToHtml(example.source, { lang: example.language, theme: 'rsvelte' })])),
		examples: Object.fromEntries(Object.entries(examples[lang]).map(([key, source]) => [key, syntax.codeToHtml(source, {
			lang: 'svelte',
			theme: 'rsvelte',
			transformers: [{
				span(element, _line, _column, _lineElement, token) {
					const children: typeof element.children = [];
					let offset = 0;
					for (const match of token.content.matchAll(/\b(?:name|greeting)\b/g)) {
						children.push({ type: 'text', value: token.content.slice(offset, match.index) });
						children.push({
							type: 'element', tagName: 'span',
							properties: { className: [match[0] === 'name' ? 'variable-reference' : 'selector-reference'] },
							children: [{ type: 'text', value: match[0] }]
						});
						offset = match.index + match[0].length;
					}
					if (children.length) {
						children.push({ type: 'text', value: token.content.slice(offset) });
						element.children = children;
					}
				}
			}]
		})]))
	};
};
