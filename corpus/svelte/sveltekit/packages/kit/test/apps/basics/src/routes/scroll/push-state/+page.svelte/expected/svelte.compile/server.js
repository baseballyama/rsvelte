import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function handleClick() {
			goto('', { shallow: true, state: { active: true } });
		}

		$$renderer.push(`<a id="subpage-link" href="/scroll/push-state/a">Subpage</a> <!--[-->`);

		const each_array = $.ensure_array_like({ length: 20 });

		for (let n = 0, $$length = each_array.length; n < $$length; n++) {
			let _ = each_array[n];

			$$renderer.push(`<p>#${$.escape(n)}</p>`);
		}

		$$renderer.push(`<!--]--> <button id="shallow-button" type="button">Shallow</button> `);

		if (page.state.active) {
			$$renderer.push(`<!--[0--><button id="back-button" type="button">Back</button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}