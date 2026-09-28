import * as $ from 'svelte/internal/server';
import { goto, refreshAll } from '$app/navigation';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		/** @type {string | null} */
		let resolved = null;

		function one() {
			void goto('', { shallow: true, state: { active: true } });
		}

		function two() {
			void goto('/shallow-routing/push-state/a', { state: { active: true }, shallow: true });
		}

		async function params() {
			await goto('/shallow-routing/push-state/hello', { state: { active: true }, shallow: true });
			resolved = document.querySelector('p')?.textContent ?? null;
		}

		$$renderer.push(`<h1>parent</h1> <button data-id="one">add state on current page</button> <button data-id="two">shallow navigate to child page</button> <button data-id="params">shallow navigate to parameterized page</button> <button data-id="cancel">cancel</button> <button data-id="state-only">state only</button> <button data-id="state-only-persist">persist state only</button> <button data-id="shallow-persist">persist shallow state</button> <button data-id="goto-state">goto with state</button> <button data-id="goto-persist">persist goto state</button> <button data-id="end-shallow">end shallow</button> <button data-id="refresh">refresh all</button> <div style="position: fixed; right: 0; bottom: 0"><input data-id="options-focus" aria-label="focus target"/> <button data-id="options-default">default options</button> <button data-id="options-false">disabled options</button></div> <p>active: ${$.escape(page.state.active ?? false)}</p> <span data-id="shallow">${$.escape(page.shallow
			? `${page.shallow.url.pathname} ${page.shallow.route?.id ?? 'null'} ${JSON.stringify(page.shallow.params)}`
			: 'null')}</span> <span data-id="resolved">${$.escape(resolved)}</span> <span data-id="now">${$.escape(data.now)}</span> <div style="height: 2000px"></div>`);
	});
}