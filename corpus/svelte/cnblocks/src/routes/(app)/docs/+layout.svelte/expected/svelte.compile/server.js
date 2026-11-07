import * as $ from 'svelte/internal/server';
import Sidebar from "$lib/web/docs/Sidebar.svelte";

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<div class="mx-auto mt-10 flex min-h-[52vh] max-w-6xl lg:gap-12"><div>`);
	Sidebar($$renderer, {});
	$$renderer.push(`<!----></div> <div class="h-fit w-full px-6">`);
	children($$renderer);
	$$renderer.push(`<!----></div></div>`);
}