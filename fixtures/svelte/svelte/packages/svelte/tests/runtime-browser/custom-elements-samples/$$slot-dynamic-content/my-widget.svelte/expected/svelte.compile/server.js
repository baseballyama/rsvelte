import * as $ from 'svelte/internal/server';

export default function My_widget($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`fallback`);
	});

	$$renderer.push(`<!--]--> <!--[-->`);

	$.slot($$renderer, $$props, 'named', {}, () => {
		$$renderer.push(`<p>named fallback</p>`);
	});

	$$renderer.push(`<!--]-->`);
}