import * as $ from 'svelte/internal/server';
import { slide } from 'svelte/transition';

export default function Accordion_item($$renderer, $$props) {
	let { title, children } = $$props;
	let open = false;

	function toggle() {
		open = !open;
	}

	$$renderer.push(`<div class="accordion-item svelte-sjmdz8"><button class="accordion-heading svelte-sjmdz8"><div>${$.escape(title)}</div> <div${$.attr_class('accordion-trigger svelte-sjmdz8', void 0, { 'open': open })}>👈️</div></button> `);

	if (open) {
		$$renderer.push(`<!--[0--><div class="accordion-content svelte-sjmdz8">`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div>`);
}