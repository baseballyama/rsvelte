import * as $ from 'svelte/internal/server';

export default function Layout($$renderer, $$props) {
	$$renderer.push(`<p>This <code>p</code> and the <code>slot</code> below are direct children of the root.</p> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}