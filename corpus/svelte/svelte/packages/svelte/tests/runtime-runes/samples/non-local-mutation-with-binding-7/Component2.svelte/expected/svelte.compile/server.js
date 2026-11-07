import * as $ from 'svelte/internal/server';

export default function Component2($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { rows = [] } = $$props;

		if (rows.length) {
			$$renderer.push(`<!--[0--><input type="checkbox"${$.attr('checked', rows[0].check, true)}/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { rows });
	});
}