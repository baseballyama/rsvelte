import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart, Tooltip } from 'layerchart';
import { format } from '@layerstack/utils';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<div class="whitespace-nowrap"> </div> <div class="font-semibold"> </div>`, 1);

var root_1 = $.from_html(`<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium, ligula ac sollicitudin
	ullamcorper, leo justo pretium tellus, at gravida ex quam et orci. <!> Sed ipsum justo, facilisis id tempor hendrerit, suscipit eu ipsum. Mauris ut sapien quis nibh volutpat
	venenatis. Ut viverra justo varius sapien convallis venenatis vel faucibus urna.</p>`);

export default function Sparkline_within_a_paragraph_with_tooltip_and_highlight($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 50, min: 50, max: 100 });
	var $$exports = { data };
	var p = root_1();
	var node = $.sibling($.child(p));

	{
		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_1 = root();
					var div = $.first_child(fragment_1);
					var text = $.only_child(div, true);
					var div_1 = $.sibling(div, 2);
					var text_1 = $.only_child(div_1, true);

					$.template_effect(
						($0) => {
							$.set_text(text, $0);
							$.set_text(text_1, data().value);
						},
						[() => format(data().date, 'day')]
					);

					$.append($$anchor, fragment_1);
				};

				let $0 = $.derived(() => context().height + 4);

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						get context() {
							return context();
						},
						class: 'text-xs',
						contained: false,
						get y() {
							return $.get($0);
						},
						xOffset: 0,
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment);
		};

		LineChart(node, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			yDomain: null,
			axis: false,
			grid: false,
			props: {
				highlight: { points: { r: 3, class: 'stroke-2 stroke-surface-100' } }
			},
			height: 18,
			width: 124,
			class: 'inline-block',
			tooltip,
			$$slots: { tooltip: true }
		});
	}

	$.next();
	$.reset(p);
	$.append($$anchor, p);

	return $.pop($$exports);
}