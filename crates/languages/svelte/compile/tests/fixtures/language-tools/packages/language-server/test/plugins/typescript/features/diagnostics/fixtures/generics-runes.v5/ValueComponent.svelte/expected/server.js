import * as $ from 'svelte/internal/server';

export default function ValueComponent($$renderer, $$props) {
	let { value, defaultValue } = $$props;

	$$renderer.push(`<!---->${$.escape(value)}
${$.escape(defaultValue)}`);
}