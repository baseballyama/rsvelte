import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Button, Checkbox, Pane } from 'svelte-tweakpane-ui';
import { Canvas } from '@threlte/core';

export default function App($$renderer) {
	const sides = ['left', 'right'];
	let i = 0;
	let side = $.derived(() => sides[i]);
	let useEnvironment = true;
	let isBackground = false;
	let disabled = $.derived(() => !useEnvironment);
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'Environment - Swapping Scenes',
			position: 'fixed',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'use <Environment>',
					get value() {
						return useEnvironment;
					},

					set value($$value) {
						useEnvironment = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					disabled: disabled(),
					label: 'is background',
					get value() {
						return isBackground;
					},

					set value($$value) {
						isBackground = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);
				Button($$renderer, { disabled: disabled(), title: 'swap scene' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-hyg9v3">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { isBackground, side: side(), useEnvironment });
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