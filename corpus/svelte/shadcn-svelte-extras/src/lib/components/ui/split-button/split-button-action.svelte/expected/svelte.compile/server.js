import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';
import { useSplitButtonAction } from './split-button.svelte.js';
import { box } from 'svelte-toolbelt';

export default function Split_button_action($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value,
			onclick,
			disabled,
			loading,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const state = useSplitButtonAction({
			value: box.with(() => value),
			onclick: box.with(() => onclick)
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (state.isActive) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, $.spread_props([
					{
						disabled: disabled || state.rootState.disabled,
						loading: loading || state.rootState.loading,
						onclick: (e) => state.onclick(e)
					},
					rest,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							children?.($$renderer);
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}