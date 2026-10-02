import * as $ from 'svelte/internal/server';

export default function Ts_$props02_type_output($$renderer, $$props) {
	let { name } = $$props; // name: string, name: string, name: string, $props(): { name: string; }

	$$renderer.push(`<!---->${$.escape(name)}`);
}