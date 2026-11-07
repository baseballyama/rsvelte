import * as $ from 'svelte/internal/server';
import { usePortalContext } from './usePortalContext.svelte.js';

export default function PortalTarget($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { id = 'default' } = $$props;
		const portals = usePortalContext();
		const childrenArray = $.derived(() => portals.get(id));

		if (childrenArray() !== undefined) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(childrenArray());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let children = each_array[$$index];

				children($$renderer);
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}