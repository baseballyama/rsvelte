import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chart from '../Chart/Chart.svelte';
import Layer from '../layers/Layer.svelte';

var root = $.from_svg(`<rect></rect>`);

export default function BrushContextAccessHarness($$anchor, $$props) {
	let chartProps = $.prop($$props, 'chartProps', 19, () => ({}));

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var rect = root();

							$.template_effect(() => {
								$.set_attribute(rect, 'x', context().brush.range.x);
								$.set_attribute(rect, 'width', context().brush.handleSize);
								$.set_attribute(rect, 'height', context().brush.range.height);
							});

							$.append($$anchor, rect);
						};

						$.if(node, ($$render) => {
							if (context().brush.active) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		Chart($$anchor, $.spread_props(chartProps, {
			brush: true,
			height: 40,
			children,
			$$slots: { default: true }
		}));
	}
}