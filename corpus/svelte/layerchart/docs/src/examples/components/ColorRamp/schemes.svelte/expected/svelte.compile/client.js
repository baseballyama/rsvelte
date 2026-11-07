import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as d3chromatic from 'd3-scale-chromatic';
import { scaleQuantize } from 'd3-scale';
import { ColorRamp } from 'layerchart';

var root = $.from_html(`<div><div class="text-sm"> </div> <svg><!></svg></div>`);
var root_1 = $.from_html(`<div class="grid gap-4 h-100 overflow-auto pr-2"></div>`);

export default function Schemes($$anchor, $$props) {
	$.push($$props, true);

	let width = '100%';
	let height = 20;
	const schemes = Object.entries(d3chromatic).filter(([key, value]) => key.startsWith('scheme'));
	var div = root_1();

	$.each(div, 21, () => schemes, $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let name = () => $.get($$array)[0];
		let scheme = () => $.get($$array)[1];
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var div_1 = root();
				var div_2 = $.child(div_1);
				var text = $.only_child(div_2, true);
				var svg = $.sibling(div_2, 2);

				$.set_attribute(svg, 'width', width);
				$.set_attribute(svg, 'height', height);

				var node_1 = $.child(svg);

				{
					let $0 = $.derived(() => scaleQuantize([0, 1], scheme()));

					ColorRamp(node_1, {
						get interpolator() {
							return $.get($0);
						},
						width,
						height,
						class: '[image-rendering:pixelated]'
					});
				}

				$.reset(svg);
				$.reset(div_1);
				$.template_effect(() => $.set_text(text, name()));
				$.append($$anchor, div_1);
			};

			var alternate = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				$.each(node_2, 17, scheme, $.index, ($$anchor, s, i) => {
					var fragment_2 = $.comment();
					var node_3 = $.first_child(fragment_2);

					{
						var consequent_1 = ($$anchor) => {
							var div_3 = root();
							var div_4 = $.child(div_3);
							var text_1 = $.only_child(div_4);
							var svg_1 = $.sibling(div_4, 2);

							$.set_attribute(svg_1, 'width', width);
							$.set_attribute(svg_1, 'height', height);

							var node_4 = $.child(svg_1);

							{
								let $0 = $.derived(() => scaleQuantize([0, 1], $.get(s)));

								ColorRamp(node_4, {
									get interpolator() {
										return $.get($0);
									},
									width,
									height,
									class: '[image-rendering:pixelated]'
								});
							}

							$.reset(svg_1);
							$.reset(div_3);
							$.template_effect(() => $.set_text(text_1, `${name() ?? ''}[${i}]`));
							$.append($$anchor, div_3);
						};

						var d = $.derived(() => Array.isArray($.get(s)));

						$.if(node_3, ($$render) => {
							if ($.get(d)) $$render(consequent_1);
						});
					}

					$.append($$anchor, fragment_2);
				});

				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if (typeof scheme()[0] === 'string') $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}