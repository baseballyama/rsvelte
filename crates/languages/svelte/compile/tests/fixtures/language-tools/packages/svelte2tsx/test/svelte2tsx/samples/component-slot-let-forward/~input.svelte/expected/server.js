import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	Component($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { name: n, thing, whatever: { bla } }) => {
				$$renderer.push(`<!--[-->`);
				$.slot($$renderer, $$props, 'default', { n, thing, bla }, null);
				$$renderer.push(`<!--]-->`);
			}
		}
	});
}