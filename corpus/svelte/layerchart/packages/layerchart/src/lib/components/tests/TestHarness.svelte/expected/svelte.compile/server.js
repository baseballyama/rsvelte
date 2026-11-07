import * as $ from 'svelte/internal/server';
import Chart from '../Chart/Chart.svelte';
import Layer from '../layers/Layer.svelte';

export const componentTestId = 'test-lc-component';
export const chartTestId = 'test-lc-chart';

export default function TestHarness($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			useChart = true,
			chartProps = {},
			layer = 'svg',
			layerProps = {},
			component,
			componentProps = {},
			childComponents = [],
			oncontext
		} = $$props;

		let chartContext = void 0;
		const TestComponent = $.derived(() => component);

		// Merge defaults with chartProps so chartProps can override defaults
		const mergedChartProps = $.derived(() => ({ height: 300, ...chartProps }));

		// Merge future defaults with componentProps so componentProps can override defaults
		const mergedComponentProps = $.derived(() => ({ ...componentProps }));

		function resolveProps(props, snippetProps) {
			if (typeof props === 'function') {
				return props(snippetProps);
			}

			return props ?? {};
		}

		function Component($$renderer) {
			{
				function children($$renderer, snippetProps) {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(childComponents);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let child = each_array[$$index];

						if (child.component) {
							$$renderer.push('<!--[-->');
							child.component($$renderer, $.spread_props([resolveProps(child.props, snippetProps)]));
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]-->`);
				}

				if (TestComponent()) {
					$$renderer.push('<!--[-->');

					TestComponent()($$renderer, $.spread_props([
						mergedComponentProps(),
						{
							'data-testid': componentTestId,
							children,
							$$slots: { default: true }
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (useChart) {
				$$renderer.push('<!--[0-->');

				Chart($$renderer, $.spread_props([
					mergedChartProps(),
					{
						'data-testid': chartTestId,
						get context() {
							return chartContext;
						},

						set context($$value) {
							chartContext = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							Layer($$renderer, $.spread_props([
								{ center: true, type: layer },
								layerProps,
								{
									children: ($$renderer) => {
										Component($$renderer);
									},
									$$slots: { default: true }
								}
							]));
						},
						$$slots: { default: true }
					}
				]));
			} else {
				$$renderer.push('<!--[-1-->');
				Component($$renderer);
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}