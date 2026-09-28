import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Waffle, Axis, Text } from 'layerchart';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="text-center mb-2"><h3 class="text-2xl font-bold">Subdued</h3> <p class="text-sm text-surface-content/60"></p></div> <!>`, 1);

export default function Survey($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ question: 'don’t go out after dark', yes: 96 },
		{ question: 'do no activities other than school', yes: 89 },
		{
			question: 'engage in political discussion and social movements, including online',
			yes: 10
		},

		{
			question: 'would like to do activities but are prevented by safety concerns',
			yes: 73
		}
	];

	const TOTAL = 120;
	var $$exports = { data };
	var fragment = root_1();
	var div = $.first_child(fragment);
	var p = $.sibling($.child(div), 2);

	p.textContent = 'Of 120 surveyed Syrian teenagers:';
	$.reset(div);

	var node = $.sibling(div, 2);

	{
		const axis = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			{
				let $0 = $.derived(() => ({
					width: (context().xScale.bandwidth?.() ?? 0) - 8,
					truncate: false,
					dy: 36,
					class: 'text-xs fill-surface-content/70'
				}));

				Axis($$anchor, {
					placement: 'bottom',
					tickLength: 0,
					get tickLabelProps() {
						return $.get($0);
					}
				});
			}
		};

		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const bw = $.derived(() => context().xScale.bandwidth?.() ?? 0);
			var fragment_2 = root();
			var node_1 = $.first_child(fragment_2);

			Waffle(node_1, {
				y: () => TOTAL,
				fill: 'currentColor',
				fillOpacity: 0.2,
				rx: '100%',
				gap: 2
			});

			var node_2 = $.sibling(node_1, 2);

			Waffle(node_2, { fill: 'orange', rx: '100%', gap: 2 });

			var node_3 = $.sibling(node_2, 2);

			{
				let $0 = $.derived(() => $.get(bw) / 2);
				let $1 = $.derived(() => context().height + 8);

				Text(node_3, {
					get data() {
						return data;
					},
					x: 'question',
					get dx() {
						return $.get($0);
					},

					get y() {
						return $.get($1);
					},
					value: (d) => `${Math.round(d.yes / TOTAL * 100)}%`,
					textAnchor: 'middle',
					verticalAnchor: 'start',
					class: 'text-xl font-bold',
					fill: 'orange'
				});
			}

			$.append($$anchor, fragment_2);
		};

		Chart(node, {
			get data() {
				return data;
			},
			x: 'question',
			bandPadding: 0.2,
			y: 'yes',
			yDomain: [0, TOTAL],
			height: 300,
			padding: { top: 8, bottom: 90, left: 0, right: 0 },
			grid: false,
			axis,
			marks,
			$$slots: { axis: true, marks: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}