import * as $ from 'svelte/internal/server';
import TailwindIndicator from "$lib/components/tailwind-indicator.svelte";
import "../app.css";

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	TailwindIndicator($$renderer, {});
	$$renderer.push(`<!----> `);
	children($$renderer);
	$$renderer.push(`<!---->`);
}