import * as $ from 'svelte/internal/server';

export default function Ts_$props02_input($$renderer, $$props) {
	let { name } = $$props;

	$$renderer.push(`<!---->${$.escape(name)}`);
}