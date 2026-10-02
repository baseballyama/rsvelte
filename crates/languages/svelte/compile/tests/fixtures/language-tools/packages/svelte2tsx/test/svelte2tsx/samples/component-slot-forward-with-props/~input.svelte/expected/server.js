import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	Parent($$renderer, {
		propA: true,
		propB,
		propC: 'val1',
		propD: 'val2',
		propE: `a${$.stringify(a)}b${$.stringify(b)}`,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { foo }) => {
				$$renderer.push(`<!--[-->`);
				$.slot($$renderer, $$props, 'default', { foo }, null);
				$$renderer.push(`<!--]-->`);
			}
		}
	});
}