import * as $ from 'svelte/internal/server';
import Chart from '$lib/components/Chart/Chart.svelte';
import Layer from '$lib/components/layers/Layer.svelte';
import ComponentNodeLifecycleChild from './ComponentNodeLifecycleChild.svelte';
import ComponentNodeLifecycleParent from './ComponentNodeLifecycleParent.svelte';

export default function ComponentNodeLifecycleHarness($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { oncontext, onparentnode } = $$props;
		let chartContext = void 0;
		let showChild = true;

		function toggleChild() {
			showChild = !showChild;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<button type="button" data-testid="toggle-child">toggle</button> `);

			Chart($$renderer, {
				data: [{ date: '2024-01', value: 10 }],
				x: 'date',
				y: 'value',
				width: 300,
				height: 300,
				get context() {
					return chartContext;
				},

				set context($$value) {
					chartContext = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Layer($$renderer, {
						type: 'html',
						children: ($$renderer) => {
							ComponentNodeLifecycleParent($$renderer, {
								onparentnode,
								children: ($$renderer) => {
									if (showChild) {
										$$renderer.push('<!--[0-->');
										ComponentNodeLifecycleChild($$renderer, {});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
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