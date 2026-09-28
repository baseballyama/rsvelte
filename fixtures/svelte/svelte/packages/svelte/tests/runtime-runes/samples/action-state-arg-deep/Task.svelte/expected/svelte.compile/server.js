import * as $ from 'svelte/internal/server';

export default function Task($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { prop } = $$props;
		let trackedState = 0;
		const getTrackedState = () => trackedState;

		function dummyAction(el, { getTrackedState, propFromComponent }) {}

		$$renderer.push(`<div class="container">${$.escape(JSON.stringify(prop))}</div> <button>update tracked state</button>`);
	});
}