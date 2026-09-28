import * as $ from 'svelte/internal/server';
import ButtonGroup from '$lib/components/ui/button-group/button-group.svelte';
import { useSplitButtonRoot } from './split-button.svelte.js';
import { box } from 'svelte-toolbelt';

export default function Split_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			orientation = 'horizontal',
			value = undefined,
			disabled,
			onclick,
			onClickPromise,
			onActionSelect,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		useSplitButtonRoot({
			value: box.with(() => value, (v) => value = v),
			disabled: box.with(() => disabled),
			onclick: box.with(() => onclick),
			onClickPromise: box.with(() => onClickPromise),
			onActionSelect: box.with(() => onActionSelect)
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ButtonGroup($$renderer, $.spread_props([
				{ class: className, orientation },
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref, value });
	});
}