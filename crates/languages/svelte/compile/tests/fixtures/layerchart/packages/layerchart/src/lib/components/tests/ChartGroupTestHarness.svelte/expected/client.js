import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chart from '../Chart/Chart.svelte';
import ChartGroup from '../ChartGroup.svelte';

export default function ChartGroupTestHarness($$anchor, $$props) {
	$.push($$props, true);

	const /** Provide the group via `<ChartGroup>` context rather than an explicit `group` prop */
	/** Chart component to render — defaults to `Chart`, override to test simplified charts */
	charts = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.each(node, 17, members, $.index, ($$anchor, member, i) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => useContext() ? undefined : $$props.group);

				$.component(node_1, () => $.get(ChartComponent), ($$anchor, ChartComponent_1) => {
					ChartComponent_1($$anchor, $.spread_props(
						{
							width: 400,
							height: 200,
							padding: { top: 0, right: 0, bottom: 0, left: 20 }
						},
						() => $.get(member).chartProps,
						{
							get group() {
								return $.get($0);
							},

							get groupOptions() {
								return $.get(member).groupOptions;
							},

							get context() {
								return contexts[i];
							},

							set context($$value) {
								contexts[i] = $$value;
							}
						}
					));
				});
			}

			$.append($$anchor, fragment_1);
		});

		$.append($$anchor, fragment);
	};

	let members = $.prop($$props, 'members', 19, () => []),
		useContext = $.prop($$props, 'useContext', 3, false),
		component = $.prop($$props, 'component', 3, Chart);

	const ChartComponent = $.derived(component);
	let contexts = $.proxy([]);

	$.user_effect(() => {
		contexts.forEach((ctx, i) => ctx && $$props.oncontext?.(ctx, i));
	});

	var fragment_2 = $.comment();
	var node_2 = $.first_child(fragment_2);

	{
		var consequent = ($$anchor) => {
			{
				const children = ($$anchor, $$arg0) => {
					let contextGroup = () => ($$arg0?.()).group;
					const _ = $.derived(() => $$props.ongroup?.(contextGroup()));

					charts($$anchor);
				};

				ChartGroup($$anchor, {
					get pointer() {
						return $$props.pointer;
					},

					get brush() {
						return $$props.brush;
					},

					get domain() {
						return $$props.domain;
					},

					get series() {
						return $$props.series;
					},
					children,
					$$slots: { default: true }
				});
			}
		};

		var alternate = ($$anchor) => {
			charts($$anchor);
		};

		$.if(node_2, ($$render) => {
			if (useContext()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment_2);
	$.pop();
}