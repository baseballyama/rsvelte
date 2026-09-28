import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		async function one() {
			await goto('', { shallow: true, replace: true, state: { active: true } });
		}

		async function two() {
			await goto('/shallow-routing/replace-state/a', { replace: true, shallow: true, state: { active: true } });
		}

		$$renderer.push(`<h1>parent</h1> <button data-id="one">replace state on current page</button> <button data-id="two">shallow navigate and replace</button> <button data-id="end-shallow">end shallow</button> <button data-id="state-only">persist state only</button> <p>active: ${$.escape(page.state.active ?? false)}</p> <span data-id="shallow">${$.escape(page.shallow ? page.shallow.url.pathname : 'null')}</span>`);
	});
}