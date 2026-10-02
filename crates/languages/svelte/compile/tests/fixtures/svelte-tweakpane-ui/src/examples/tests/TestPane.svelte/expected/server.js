import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { Pane, Slider } from '$lib';

export default function TestPane($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let tpPane;

		onMount(() => {
			// Have your way with the pane...
			tpPane.on('change', (event) => {
				console.log(event);
			});
		});

		let speed = 50;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				get tpPane() {
					return tpPane;
				},

				set tpPane($$value) {
					tpPane = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Slider($$renderer, {
						max: 100,
						min: 0,
						get value() {
							return speed;
						},

						set value($$value) {
							speed = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}