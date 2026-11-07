import * as $ from 'svelte/internal/server';

export default function Named_slots02_input($$renderer, $$props) {
	$$renderer.push(`<article class="contact-card svelte-9fyfo5"><h2 class="svelte-9fyfo5"><!--[-->`);

	$.slot($$renderer, $$props, 'name', {}, () => {
		$$renderer.push(`<span class="missing svelte-9fyfo5">Unknown name</span>`);
	});

	$$renderer.push(`<!--]--></h2> <div class="address svelte-9fyfo5"><!--[-->`);

	$.slot($$renderer, $$props, 'address', {}, () => {
		$$renderer.push(`<span class="missing svelte-9fyfo5">Unknown address</span>`);
	});

	$$renderer.push(`<!--]--></div> <div class="email svelte-9fyfo5"><!--[-->`);

	$.slot($$renderer, $$props, 'email', {}, () => {
		$$renderer.push(`<span class="missing svelte-9fyfo5">Unknown email</span>`);
	});

	$$renderer.push(`<!--]--></div></article>`);
}