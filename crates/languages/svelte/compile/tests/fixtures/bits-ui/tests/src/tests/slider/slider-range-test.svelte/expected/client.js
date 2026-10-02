import 'svelte/internal/disclose-version';
import { Slider } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value']);
var root = $.from_html(`<span class="bg-primary/20 relative h-1.5 w-full grow overflow-hidden rounded-full"><!></span> <!> <!>`, 1);
var root_1 = $.from_html(`<main><!></main>`);

export default function Slider_range_test($$anchor, $$props) {
	let value = $.prop($$props, 'value', 23, () => [20, 80]),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_1();
	var node = $.child(main);

	{
		const children = ($$anchor, $$arg0) => {
			let thumbItems = () => ($$arg0?.()).thumbItems;
			let tickItems = () => ($$arg0?.()).tickItems;
			var fragment = root();
			var span = $.first_child(fragment);
			var node_1 = $.child(span);

			$.component(node_1, () => Slider.Range, ($$anchor, Slider_Range) => {
				Slider_Range($$anchor, { 'data-testid': 'range', class: 'bg-primary absolute h-full' });
			});

			$.reset(span);

			var node_2 = $.sibling(span, 2);

			$.each(node_2, 19, thumbItems, ({ index }) => index, ($$anchor, $$item, i) => {
				let index = () => $.get($$item).index;
				var fragment_1 = $.comment();
				var node_3 = $.first_child(fragment_1);

				$.component(node_3, () => Slider.Thumb, ($$anchor, Slider_Thumb) => {
					Slider_Thumb($$anchor, {
						get index() {
							return index();
						},
						'aria-label': 'Volume',
						get 'data-testid'() {
							return `thumb-${$.get(i) ?? ''}`;
						},
						class: 'border-primary/50 focus-visible:ring-ring bg-background block h-4 w-4 rounded-full border shadow transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50'
					});
				});

				$.append($$anchor, fragment_1);
			});

			var node_4 = $.sibling(node_2, 2);

			$.each(node_4, 17, tickItems, ({ index }) => index, ($$anchor, $$item) => {
				let index = () => $.get($$item).index;
				var fragment_2 = $.comment();
				var node_5 = $.first_child(fragment_2);

				$.component(node_5, () => Slider.Tick, ($$anchor, Slider_Tick) => {
					Slider_Tick($$anchor, {
						'data-testid': 'tick',
						get index() {
							return index();
						}
					});
				});

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment);
		};

		$.component(node, () => Slider.Root, ($$anchor, Slider_Root) => {
			Slider_Root($$anchor, $.spread_props({ type: 'multiple', 'data-testid': 'root' }, () => restProps, {
				get value() {
					return value();
				},

				set value($$value) {
					value($$value);
				},
				children,
				$$slots: { default: true }
			}));
		});
	}

	$.reset(main);
	$.append($$anchor, main);
}