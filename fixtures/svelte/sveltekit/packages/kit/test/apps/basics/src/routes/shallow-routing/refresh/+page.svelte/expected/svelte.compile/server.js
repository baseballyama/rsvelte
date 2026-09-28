import * as $ from 'svelte/internal/server';
import { goto, invalidate, invalidateAll, refreshAll } from '$app/navigation';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		function activate() {
			goto('', { shallow: true, state: { active: true } });
		}

		$$renderer.push(`<h1>refresh</h1> <button data-id="activate">add state</button> <button data-id="refreshAll">refreshAll</button> <button data-id="invalidate">invalidate</button> <button data-id="invalidateAll">invalidateAll</button> <p>active: ${$.escape(page.state.active ?? false)}</p> <span>${$.escape(data.now)}</span>`);
	});
}