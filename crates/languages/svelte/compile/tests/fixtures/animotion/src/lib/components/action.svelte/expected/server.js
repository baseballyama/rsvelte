import * as $ from 'svelte/internal/server';
import Action from '$lib/components/action.svelte';

export default function Action_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { order, actions, $$slots, $$events, ...props } = $$props;
		let el = void 0;
		const noop = () => {};
		const action = () => props?.do?.() ?? noop();
		const undo = () => props?.undo?.() ?? noop();

		if (actions) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(actions);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let action = each_array[i];
				const previousAction = i === 0 ? undo : actions[i - 1];

				Action($$renderer, { do: action, undo: previousAction });
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><div class="fragment hidden"${$.attr('data-fragment-index', order)}></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}