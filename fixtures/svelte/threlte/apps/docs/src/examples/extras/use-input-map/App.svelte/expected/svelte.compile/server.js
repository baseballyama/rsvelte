import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Pane, List, Text } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	const sprintKeyOptions = { Shift: 'Shift', Space: 'Space', e: 'e' };
	let sprintKey = 'Shift';
	let activeDevice = 'keyboard';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'Input',
			position: 'fixed',
			children: ($$renderer) => {
				List($$renderer, {
					options: sprintKeyOptions,
					label: 'sprint key',
					get value() {
						return sprintKey;
					},

					set value($$value) {
						sprintKey = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);
				Text($$renderer, { value: activeDevice, label: 'device', disabled: true });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-1x9gam7">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, {
					sprintKey,
					get activeDevice() {
						return activeDevice;
					},

					set activeDevice($$value) {
						activeDevice = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}