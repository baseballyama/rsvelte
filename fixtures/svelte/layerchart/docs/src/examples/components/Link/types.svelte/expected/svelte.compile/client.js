import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Circle, Layer, Link } from 'layerchart';

export const title = 'Link types';
export const description = 'Link supports several path types across cartesian and radial orientations.';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-2"><!> <span class="text-xs text-surface-content/50 w-20 shrink-0"> </span></div>`);
var root_2 = $.from_html(`<div><div class="text-center text-sm font-semibold text-surface-content/60 mb-2"> </div> <div class="flex flex-col gap-2"></div></div>`);
var root_3 = $.from_html(`<div class="grid gap-4"></div>`);

export default function Types($$anchor) {
	const types = ['straight', 'square', 'beveled', 'rounded', 'swoop', 'd3'];

	const orientations = [
		{ label: 'horizontal', value: 'horizontal' },
		{ label: 'vertical', value: 'vertical' }
	];

	const chartHeight = 100;
	const pad = 16;
	var div = root_3();

	$.each(div, 21, () => orientations, ({ label, value }) => label, ($$anchor, $$item) => {
		let label = () => $.get($$item).label;
		let value = () => $.get($$item).value;
		var div_1 = root_2();
		var div_2 = $.child(div_1);
		var text = $.only_child(div_2, true);
		var div_3 = $.sibling(div_2, 2);

		$.each(div_3, 20, () => types, (type) => type, ($$anchor, type) => {
			var div_4 = root_1();
			var node = $.child(div_4);

			{
				const children = ($$anchor, $$arg0) => {
					let context = () => ($$arg0?.()).context;
					const x1 = $.derived(() => 0);
					const y1 = $.derived(() => 0);
					const x2 = $.derived(() => context().width);
					const y2 = $.derived(() => context().height);

					Layer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_1 = $.first_child(fragment_1);

							Link(node_1, {
								x1: $.get(x1),
								y1: $.get(y1),
								get x2() {
									return $.get(x2);
								},

								get y2() {
									return $.get(y2);
								},

								get type() {
									return type;
								},

								get orientation() {
									return value();
								},
								class: 'stroke-primary stroke-2 fill-none'
							});

							var node_2 = $.sibling(node_1, 2);

							Circle(node_2, { cx: $.get(x1), cy: $.get(y1), r: 4, class: 'fill-info' });

							var node_3 = $.sibling(node_2, 2);

							Circle(node_3, {
								get cx() {
									return $.get(x2);
								},

								get cy() {
									return $.get(y2);
								},
								r: 4,
								class: 'fill-accent'
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				};

				Chart(node, {
					height: chartHeight,
					padding: pad,
					class: 'flex-1',
					children,
					$$slots: { default: true }
				});
			}

			var span = $.sibling(node, 2);
			var text_1 = $.only_child(span, true);

			$.reset(div_4);
			$.template_effect(() => $.set_text(text_1, type));
			$.append($$anchor, div_4);
		});

		$.reset(div_3);
		$.reset(div_1);
		$.template_effect(() => $.set_text(text, label()));
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.template_effect(() => $.set_style(div, `grid-template-columns: repeat(${orientations.length ?? ''}, minmax(0, 1fr));`));
	$.append($$anchor, div);
}