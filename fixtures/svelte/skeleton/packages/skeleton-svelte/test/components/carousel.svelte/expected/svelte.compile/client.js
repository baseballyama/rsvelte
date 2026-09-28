import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Carousel } from '../../src/index.js';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Carousel_1($$anchor) {
	Carousel($$anchor, {
		slideCount: 3,
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => Carousel.Control, ($$anchor, Carousel_Control) => {
				Carousel_Control($$anchor, {
					'data-testid': 'control',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Carousel.PrevTrigger, ($$anchor, Carousel_PrevTrigger) => {
							Carousel_PrevTrigger($$anchor, { 'data-testid': 'prev-trigger' });
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Carousel.NextTrigger, ($$anchor, Carousel_NextTrigger) => {
							Carousel_NextTrigger($$anchor, { 'data-testid': 'next-trigger' });
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Carousel.AutoplayTrigger, ($$anchor, Carousel_AutoplayTrigger) => {
							Carousel_AutoplayTrigger($$anchor, { 'data-testid': 'autoplay-trigger' });
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node, 2);

			$.component(node_4, () => Carousel.ItemGroup, ($$anchor, Carousel_ItemGroup) => {
				Carousel_ItemGroup($$anchor, {
					'data-testid': 'item-group',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_5 = $.first_child(fragment_3);

						$.component(node_5, () => Carousel.Item, ($$anchor, Carousel_Item) => {
							Carousel_Item($$anchor, { index: 0, 'data-testid': 'item' });
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node_4, 2);

			$.component(node_6, () => Carousel.IndicatorGroup, ($$anchor, Carousel_IndicatorGroup) => {
				Carousel_IndicatorGroup($$anchor, {
					'data-testid': 'indicator-group',
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = $.comment();
						var node_7 = $.first_child(fragment_4);

						$.component(node_7, () => Carousel.Indicator, ($$anchor, Carousel_Indicator) => {
							Carousel_Indicator($$anchor, { index: 0, 'data-testid': 'indicator' });
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			var node_8 = $.sibling(node_6, 2);

			$.component(node_8, () => Carousel.ProgressText, ($$anchor, Carousel_ProgressText) => {
				Carousel_ProgressText($$anchor, { 'data-testid': 'progress-text' });
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}