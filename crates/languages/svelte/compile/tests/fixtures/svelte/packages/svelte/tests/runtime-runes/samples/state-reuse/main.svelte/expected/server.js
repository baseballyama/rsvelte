import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let foo = { value: 'a' };
		let state1 = foo;
		let state2 = foo;

		$$renderer.push(`<button>state1.value: ${$.escape(
			// This contains Symbol.$state and Symbol.$readonly and we can't do anything against it,
			// because it's called on the original object, not our state proxy
			// $.proxy will see that Symbol.$state exists on this object already, which shouldn't result in a stale value
			// $.proxy can't look into Symbol.$state because of the frozen object
			state1.value
		)}
state2.value: ${$.escape(state2.value)}</button>`);
	});
}