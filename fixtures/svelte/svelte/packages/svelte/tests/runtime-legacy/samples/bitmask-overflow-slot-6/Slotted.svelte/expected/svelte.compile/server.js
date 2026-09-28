import * as $ from 'svelte/internal/server';

export default function Slotted($$renderer, $$props) {
	let open = false;

	function toggle() {
		open = !open;
	}

	$$renderer.push(`<div><!--[-->`);
	$.slot($$renderer, $$props, 'target', { open }, null);
	$$renderer.push(`<!--]--> `);

	if (open) {
		$$renderer.push(`<!--[0--><!--[-->`);
		$.slot($$renderer, $$props, 'content', {}, null);
		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div>`);
}