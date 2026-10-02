import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer, $$props) {
	let { data, errors, foo, bar } = $$props;

	$$renderer.push(`<!---->${$.escape(data)}, ${$.escape(errors)}, ${$.escape(foo)}, ${$.escape(bar)}`);
}