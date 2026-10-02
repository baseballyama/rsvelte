import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScatterChart, Tooltip } from 'layerchart';
import { randomNormal } from 'd3-random';
import { format } from '@layerstack/utils';

export default function Single_dimension($$anchor, $$props) {
	$.push($$props, true);

	const random = randomNormal();
	const data = Array.from({ length: 100 }, () => ({ value: random() }));
	var $$exports = { data };

	{
		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;

					$.next();

					var text = $.text();

					$.template_effect(($0) => $.set_text(text, $0), [() => format(context().x(data()))]);
					$.append($$anchor, text);
				};

				$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						x: 'data',
						y: 'data',
						yOffset: 12,
						anchor: 'top',
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		ScatterChart($$anchor, {
			get data() {
				return data;
			},
			x: 'value',
			y: (d) => 0,
			axis: false,
			grid: false,
			props: { points: { opacity: 0.3 }, highlight: { lines: false } },
			height: 24,
			tooltip,
			$$slots: { tooltip: true }
		});
	}

	return $.pop($$exports);
}