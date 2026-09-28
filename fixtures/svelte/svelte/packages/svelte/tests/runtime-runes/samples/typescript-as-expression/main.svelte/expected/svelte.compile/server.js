import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { log } = $$props;
		let count = 1;
		let double = $.derived(() => count * 2);
		let element = null;
		let element_with_state = null;
		let with_state = { foo: 1 };
		let without_state = { foo: 2 };

		$$renderer.push(`<!---->1 2 <div></div> <div></div> <input type="number"${$.attr('value', with_state.foo)}/> <input type="number"${$.attr('value', without_state.foo)}/>`);
	});
}