import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';
import ToggleCore from './ToggleCore.svelte';

export default function Toggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {Object} Props
		 * @property {boolean} [toggled] - Specify whether the toggle switch is toggled
		 * @property {string} [label] - Specify the label text
		 * @property {boolean} [hideLabel] - Set to `true` to visually hide the label
		 * @property {boolean} [small] - Set to `true` to use the small variant
		 * @property {boolean} [disabled] - Set to `true` to disable the button
		 * @property {string} [on] - Set a descriptor for the toggled state
		 * @property {string} [off] - Set a descriptor for the untoggled state
		 * @property {string} [switchColor] - Specify the switch color
		 * @property {string} [toggledColor] - Specify the toggled switch background color
		 * @property {string} [untoggledColor] - Specify the untoggled switch background color
		 * @property {import('svelte').Snippet<[any]>} [children]
		 */
		/** @type {Props & { [key: string]: any }} */
		let {
			toggled = true,
			label = '',
			hideLabel = false,
			small = false,
			disabled = false,
			on = undefined,
			off = undefined,
			switchColor = '#fff',
			toggledColor = '#0f62fe',
			untoggledColor = '#8d8d8d',
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const dispatch = createEventDispatcher();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { label: labelProps, button }) {
					$$renderer.push(`<label${$.attributes({ ...labelProps }, 'svelte-vzdnzf', { hideLabel })}>${$.escape(label)}</label> <div class="svelte-vzdnzf"><button${$.attributes(
						{
							...rest,
							...button,
							style: `color: ${$.stringify(switchColor)}; background-color: ${$.stringify(toggled ? toggledColor : untoggledColor)}; ${$.stringify(rest.style)}`,
							disabled,
							'aria-label': label
						},
						'svelte-vzdnzf',
						{ small }
					)}></button> `);

					if (children) {
						$$renderer.push('<!--[0-->');
						children($$renderer, { toggled });
					} else if (on && off) {
						$$renderer.push(`<!--[1--><span class="svelte-vzdnzf">${$.escape(toggled ? on : off)}</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				ToggleCore($$renderer, {
					get toggled() {
						return toggled;
					},

					set toggled($$value) {
						toggled = $$value;
						$$settled = false;
					},
					children,
					$$slots: { default: true }
				});
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { toggled });
	});
}