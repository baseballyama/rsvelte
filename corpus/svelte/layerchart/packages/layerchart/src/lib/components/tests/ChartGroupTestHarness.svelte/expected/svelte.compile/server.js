import * as $ from 'svelte/internal/server';
import Chart from '../Chart/Chart.svelte';
import ChartGroup from '../ChartGroup.svelte';

export default function ChartGroupTestHarness($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			members = [],
			/** Provide the group via `<ChartGroup>` context rather than an explicit `group` prop */
			useContext = false,

			/** Chart component to render — defaults to `Chart`, override to test simplified charts */
			component = Chart,
			pointer,
			brush,
			domain,
			series,
			group,
			oncontext,
			ongroup
		} = $$props;

		const ChartComponent = $.derived(() => component);
		let contexts = [];

		function charts($$renderer) {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(members);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let member = each_array[i];

				if (ChartComponent()) {
					$$renderer.push('<!--[-->');

					ChartComponent()($$renderer, $.spread_props([
						{
							width: 400,
							height: 200,
							padding: { top: 0, right: 0, bottom: 0, left: 20 }
						},
						member.chartProps,
						{
							group: useContext ? undefined : group,
							groupOptions: member.groupOptions,
							get context() {
								return contexts[i];
							},

							set context($$value) {
								contexts[i] = $$value;
								$$settled = false;
							}
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]-->`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (useContext) {
				$$renderer.push('<!--[0-->');

				{
					function children($$renderer, { group: contextGroup }) {
						const _ = ongroup?.(contextGroup);

						charts($$renderer);
					}

					ChartGroup($$renderer, {
						pointer,
						brush,
						domain,
						series,
						children,
						$$slots: { default: true }
					});
				}
			} else {
				$$renderer.push('<!--[-1-->');
				charts($$renderer);
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