import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);

	// to show that it doesn't bail out from the whole migration
	let count = 0;

	$$renderer.push(`<button><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></button> ${$.escape(count)} `);

	if (foo) {
		$$renderer.push(`<!--[0--><!--[-->`);
		$.slot($$renderer, $$props, 'foo', { foo }, null);
		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if ($$slots.bar) {
		$$renderer.push(`<!--[0-->${$.escape($$slots)} <!--[-->`);
		$.slot($$renderer, $$props, 'bar', {}, null);
		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if ($$slots.default) {
		$$renderer.push(`<!--[0-->foo`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if ($$slots['default']) {
		$$renderer.push(`<!--[0-->foo`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if ($$slots['dashed-name']) {
		$$renderer.push(`<!--[0-->foo`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'dashed-name', {}, null);
	$$renderer.push(`<!--]-->`);
}