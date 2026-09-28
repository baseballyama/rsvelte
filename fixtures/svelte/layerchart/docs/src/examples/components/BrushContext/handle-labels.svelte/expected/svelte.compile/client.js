import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Area, Chart, Layer, Text } from 'layerchart';
import { format } from '@layerstack/utils';

const data = await getAppleStock();
var root = $.from_html(`<!> <!>`, 1);

export default function Handle_labels($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Area(node, {
						line: { class: 'stroke-2 stroke-primary' },
						class: 'fill-primary/20'
					});

					var node_1 = $.sibling(node, 2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => context().brush.range.x - 4);
								let $1 = $.derived(() => context().brush.range.height / 2);
								let $2 = $.derived(() => format(context().brush.x?.[0]));

								Text(node_2, {
									get x() {
										return $.get($0);
									},

									get y() {
										return $.get($1);
									},

									get value() {
										return $.get($2);
									},
									textAnchor: 'end',
									verticalAnchor: 'middle',
									class: 'text-xs'
								});
							}

							var node_3 = $.sibling(node_2, 2);

							{
								let $0 = $.derived(() => context().brush.range.x + context().brush.range.width + 4);
								let $1 = $.derived(() => context().brush.range.height / 2);
								let $2 = $.derived(() => format(context().brush.x?.[1]));

								Text(node_3, {
									get x() {
										return $.get($0);
									},

									get y() {
										return $.get($1);
									},

									get value() {
										return $.get($2);
									},
									verticalAnchor: 'middle',
									class: 'text-xs'
								});
							}

							$.append($$anchor, fragment_3);
						};

						$.if(node_1, ($$render) => {
							if (context().brush.active) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			brush: true,
			height: 40,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}