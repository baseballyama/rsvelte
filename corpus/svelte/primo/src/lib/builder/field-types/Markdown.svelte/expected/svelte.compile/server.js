import * as $ from 'svelte/internal/server';
import MarkdownCodeMirror from '$lib/builder/components/CodeEditor/MarkdownCodeMirror.svelte';

export default function Markdown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { field, entry, onchange } = $$props;

		function handle_change(value) {
			onchange({ [field.key]: { 0: { value } } });
		}

		$$renderer.push(`<label${$.attr('for', field.id)} class="svelte-1ntnb93"><span class="primo--field-label svelte-1ntnb93">${$.escape(field.label)}</span> `);
		MarkdownCodeMirror($$renderer, { id: field.id, value: entry?.value });
		$$renderer.push(`<!----></label>`);
	});
}