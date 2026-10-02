import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);

	$$renderer.push(`<button><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></button> `);

	if (foos) {
		$$renderer.push(`<!--[0--><!--[-->`);
		$.slot($$renderer, $$props, 'foo', { foo: foos }, null);
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

	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'default', { header: 'something', title: my_title, id }, null);
	$$renderer.push(`<!--]-->`);
}