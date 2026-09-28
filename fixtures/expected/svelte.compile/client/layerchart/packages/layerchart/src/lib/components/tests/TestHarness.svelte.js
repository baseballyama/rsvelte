import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chart from '../Chart/Chart.svelte';
import Layer from '../layers/Layer.svelte';

export const componentTestId = 'test-lc-component';
export const chartTestId = 'test-lc-chart';

export default function TestHarness($$anchor, $$props) {
	$.push($$props, true);

	const // Merge defaults with chartProps so chartProps can override defaults
	// Merge future defaults with componentProps so componentProps can override defaults
	Component = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			const children = ($$anchor, snippetProps = $.noop) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, childComponents, $.index, ($$anchor, child) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => resolveProps($.get(child).props, snippetProps()));

						$.component(node_2, () => $.get(child).component, ($$anchor, child_component) => {
							child_component($$anchor, $.spread_props(() => $.get($0)));
						});
					}

					$.append($$anchor, fragment_2);
				});

				$.append($$anchor, fragment_1);
			};

			$.component(node, () => $.get(TestComponent), ($$anchor, TestComponent_1) => {
				TestComponent_1($$anchor, $.spread_props(() => $.get(mergedComponentProps), {
					'data-testid': componentTestId,
					children,
					$$slots: { default: true }
				}));
			});
		}

		$.append($$anchor, fragment);
	};

	let useChart = $.prop($$props, 'useChart', 3, true),
		chartProps = $.prop($$props, 'chartProps', 19, () => ({})),
		layer = $.prop($$props, 'layer', 3, 'svg'),
		layerProps = $.prop($$props, 'layerProps', 19, () => ({})),
		componentProps = $.prop($$props, 'componentProps', 19, () => ({})),
		childComponents = $.prop($$props, 'childComponents', 19, () => []);

	let chartContext = $.state(void 0);

	$.user_effect(() => {
		if ($.get(chartContext)) {
			$$props.oncontext?.($.get(chartContext));
		}
	});

	const TestComponent = $.derived(() => $$props.component);

	// Merge defaults with chartProps so chartProps can override defaults
	const mergedChartProps = $.derived(() => ({ height: 300, ...chartProps() }));

	// Merge future defaults with componentProps so componentProps can override defaults
	const mergedComponentProps = $.derived(() => ({ ...componentProps() }));

	function resolveProps(props, snippetProps) {
		if (typeof props === 'function') {
			return props(snippetProps);
		}

		return props ?? {};
	}

	var fragment_3 = $.comment();
	var node_3 = $.first_child(fragment_3);

	{
		var consequent = ($$anchor) => {
			Chart($$anchor, $.spread_props(() => $.get(mergedChartProps), {
				'data-testid': chartTestId,
				get context() {
					return $.get(chartContext);
				},

				set context($$value) {
					$.set(chartContext, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					Layer($$anchor, $.spread_props(
						{
							center: true,
							get type() {
								return layer();
							}
						},
						layerProps,
						{
							children: ($$anchor, $$slotProps) => {
								Component($$anchor);
							},
							$$slots: { default: true }
						}
					));
				},
				$$slots: { default: true }
			}));
		};

		var alternate = ($$anchor) => {
			Component($$anchor);
		};

		$.if(node_3, ($$render) => {
			if (useChart()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment_3);
	$.pop();
}