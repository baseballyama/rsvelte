import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	let klass = '';

	$$renderer.push(`<!---->${$.escape(klass)}`);
	$.bind_props($$props, { class: klass });
}