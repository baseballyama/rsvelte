import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { Pane, Slider } from '$lib';
import Checkbox from '$lib/control/Checkbox.svelte';

export default function TestPaneAdvanced($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let tpPane1;
		let tpPane2;
		let tpPane3;
		let expanded = true;
		let userExpandable = true;

		onMount(() => {
			// Have your way with the pane...
			console.log('tpPane1:', tpPane1);

			tpPane1.on('change', (event) => {
				console.log('tpPane1');
				console.log(event);
			});

			console.log('tpPane2:', tpPane2);

			tpPane2.on('change', (event) => {
				console.log('tpPane2');
				console.log(event);
			});

			console.log('tpPane3:', tpPane3);

			tpPane3.on('change', (event) => {
				console.log('tpPane3');
				console.log(event);
			});
		});

		let speed = 50;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				position: 'draggable',
				userExpandable,
				get expanded() {
					return expanded;
				},

				set expanded($$value) {
					expanded = $$value;
					$$settled = false;
				},

				get tpPane() {
					return tpPane1;
				},

				set tpPane($$value) {
					tpPane1 = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Checkbox($$renderer, {
						label: 'expanded',
						get value() {
							return expanded;
						},

						set value($$value) {
							expanded = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'user expandable',
						get value() {
							return userExpandable;
						},

						set value($$value) {
							userExpandable = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

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

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				position: 'inline',
				userExpandable,
				get expanded() {
					return expanded;
				},

				set expanded($$value) {
					expanded = $$value;
					$$settled = false;
				},

				get tpPane() {
					return tpPane2;
				},

				set tpPane($$value) {
					tpPane2 = $$value;
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

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				position: 'fixed',
				userExpandable,
				get expanded() {
					return expanded;
				},

				set expanded($$value) {
					expanded = $$value;
					$$settled = false;
				},

				get tpPane() {
					return tpPane3;
				},

				set tpPane($$value) {
					tpPane3 = $$value;
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

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}