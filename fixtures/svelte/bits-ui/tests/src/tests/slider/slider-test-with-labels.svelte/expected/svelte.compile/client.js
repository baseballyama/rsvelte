import 'svelte/internal/disclose-version';
import { Slider } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'min',
	'max',
	'step',
	'tickLabelPosition',
	'thumbLabelPosition',
	'showTickLabels',
	'showThumbLabels',
	'orientation'
]);

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span><!></span> <!> <!>`, 1);
var root_2 = $.from_html(`<main><!></main>`);

export default function Slider_test_with_labels($$anchor, $$props) {
	let value = $.prop($$props, 'value', 23, () => [30]),
		min = $.prop($$props, 'min', 3, 0),
		max = $.prop($$props, 'max', 3, 100),
		step = $.prop($$props, 'step', 3, 1),
		showTickLabels = $.prop($$props, 'showTickLabels', 3, true),
		showThumbLabels = $.prop($$props, 'showThumbLabels', 3, true),
		orientation = $.prop($$props, 'orientation', 3, "horizontal"),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_2();
	var node = $.child(main);

	{
		const children = ($$anchor, $$arg0) => {
			let thumbItems = () => ($$arg0?.()).thumbItems;
			let tickItems = () => ($$arg0?.()).tickItems;
			var fragment = root_1();
			var span = $.first_child(fragment);
			var node_1 = $.child(span);

			$.component(node_1, () => Slider.Range, ($$anchor, Slider_Range) => {
				Slider_Range($$anchor, { 'data-testid': 'range' });
			});

			$.reset(span);

			var node_2 = $.sibling(span, 2);

			$.each(node_2, 17, thumbItems, ({ index, value: thumbValue }) => index, ($$anchor, $$item) => {
				let index = () => $.get($$item).index;
				let thumbValue = () => $.get($$item).value;
				var fragment_1 = root();
				var node_3 = $.first_child(fragment_1);

				$.component(node_3, () => Slider.Thumb, ($$anchor, Slider_Thumb) => {
					Slider_Thumb($$anchor, {
						get index() {
							return index();
						},
						'aria-label': 'slider thumb',
						get 'data-testid'() {
							return `thumb-${index() ?? ''}`;
						}
					});
				});

				var node_4 = $.sibling(node_3, 2);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_5 = $.first_child(fragment_2);

						$.component(node_5, () => Slider.ThumbLabel, ($$anchor, Slider_ThumbLabel) => {
							Slider_ThumbLabel($$anchor, {
								get index() {
									return index();
								},

								get 'data-testid'() {
									return `thumb-label-${index() ?? ''}`;
								},

								get position() {
									return $$props.thumbLabelPosition;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, thumbValue()));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					};

					$.if(node_4, ($$render) => {
						if (showThumbLabels()) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_1);
			});

			var node_6 = $.sibling(node_2, 2);

			$.each(node_6, 17, tickItems, ({ index, value: tickValue }) => index, ($$anchor, $$item) => {
				let index = () => $.get($$item).index;
				let tickValue = () => $.get($$item).value;
				var fragment_4 = root();
				var node_7 = $.first_child(fragment_4);

				$.component(node_7, () => Slider.Tick, ($$anchor, Slider_Tick) => {
					Slider_Tick($$anchor, {
						get 'data-testid'() {
							return `tick-${index() ?? ''}`;
						},

						get index() {
							return index();
						}
					});
				});

				var node_8 = $.sibling(node_7, 2);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_5 = $.comment();
						var node_9 = $.first_child(fragment_5);

						$.component(node_9, () => Slider.TickLabel, ($$anchor, Slider_TickLabel) => {
							Slider_TickLabel($$anchor, {
								get index() {
									return index();
								},

								get 'data-testid'() {
									return `tick-label-${index() ?? ''}`;
								},

								get position() {
									return $$props.tickLabelPosition;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text();

									$.template_effect(() => $.set_text(text_1, tickValue()));
									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_5);
					};

					$.if(node_8, ($$render) => {
						if (showTickLabels()) $$render(consequent_1);
					});
				}

				$.append($$anchor, fragment_4);
			});

			$.append($$anchor, fragment);
		};

		$.component(node, () => Slider.Root, ($$anchor, Slider_Root) => {
			Slider_Root($$anchor, $.spread_props(
				{
					type: 'multiple',
					'data-testid': 'root',
					get orientation() {
						return orientation();
					}
				},
				() => restProps,
				{
					get min() {
						return min();
					},

					get max() {
						return max();
					},

					get step() {
						return step();
					},

					get value() {
						return value();
					},

					set value($$value) {
						value($$value);
					},
					children,
					$$slots: { default: true }
				}
			));
		});
	}

	$.reset(main);
	$.append($$anchor, main);
}