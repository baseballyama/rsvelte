import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Pane, Checkbox } from 'svelte-tweakpane-ui';
import { VRButton } from '@threlte/xr';

export default function App($$renderer) {
	let showSurfaces = false;
	let showBlockers = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'Teleport objects',
			position: 'fixed',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'Show teleport surfaces',
					get value() {
						return showSurfaces;
					},

					set value($$value) {
						showSurfaces = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					label: 'Show teleport blockers',
					get value() {
						return showBlockers;
					},

					set value($$value) {
						showBlockers = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-3iov37">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { showSurfaces, showBlockers });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		VRButton($$renderer, {});
		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}