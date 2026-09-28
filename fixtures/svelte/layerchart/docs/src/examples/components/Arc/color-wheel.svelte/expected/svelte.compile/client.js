import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Arc, Chart, Layer, Tooltip, radiansToDegrees } from 'layerchart';
import { round } from '@layerstack/utils';

var root = $.from_html(`<!> <!>`, 1);

export default function Color_wheel($$anchor, $$props) {
	$.push($$props, true);

	// color wheel
	const layerCount = 6;

	const divisions = 12;

	function wheelSegmentColor(startAngle, // in radians
	 layer, type = 'alpha') {
		const angle = Math.round(radiansToDegrees(startAngle));

		switch (type) {
			case 'saturation':
				return `hsla(${angle}, ${Math.round(layer / layerCount * 100)}%, 50%, 1)`;

			case 'lightness':
				return `hsla(${angle}, 100%, ${100 - 10 * layer}%, 1)`;

			case 'alpha':
				return `hsla(${angle}, 100%, 50%, ${round(layer / layerCount, 2)})`;
		}
	}

	const data = { layerCount, divisions };
	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Layer(node, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.each(node_1, 17, () => ({ length: layerCount }), $.index, ($$anchor, _, layerIndex) => {
						const layer = $.derived(() => layerIndex + 1);
						var fragment_3 = $.comment();
						var node_2 = $.first_child(fragment_3);

						$.each(node_2, 17, () => ({ length: divisions }), $.index, ($$anchor, _, segmentIndex, $$array) => {
							const segmentAngle = $.derived(() => 2 * Math.PI / divisions);
							const startAngle = $.derived(() => segmentIndex * $.get(segmentAngle));
							const endAngle = $.derived(() => (segmentIndex + 1) * $.get(segmentAngle));
							const color = $.derived(() => wheelSegmentColor($.get(startAngle), $.get(layer)));

							{
								let $0 = $.derived(() => $.get(layer) / layerCount);

								Arc($$anchor, {
									get startAngle() {
										return $.get(startAngle);
									},

									get endAngle() {
										return $.get(endAngle);
									},

									get outerRadius() {
										return $.get($0);
									},
									innerRadius: -20,
									cornerRadius: 4,
									padAngle: 0.02,
									get fill() {
										return $.get(color);
									},
									class: 'hover:scale-90 origin-center [transform-box:fill-box] transition-transform',
									onpointermove: (e) => context().tooltip.show(e, $.get(color)),
									onpointerleave: () => context().tooltip.hide()
								});
							}
						});

						$.append($$anchor, fragment_3);
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;

					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, data()));
					$.append($$anchor, text);
				};

				$.component(node_3, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		Chart($$anchor, {
			height: 300,
			padding: 20,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}