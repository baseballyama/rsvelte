import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	let { foo } = $$props;

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->click me`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->click me`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'foo', {}, null);
	$$renderer.push(`<!--]--> <button>click me</button>`);
}