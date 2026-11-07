import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BlocksIcon from '@lucide/svelte/icons/blocks';
import LayoutTemplateIcon from '@lucide/svelte/icons/layout-template';
import PaletteIcon from '@lucide/svelte/icons/palette';
import SparklesIcon from '@lucide/svelte/icons/sparkles';
import WandIcon from '@lucide/svelte/icons/wand-2';
import { Carousel } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<div class="preset-filled-primary-500 inline-flex items-center justify-center p-3 rounded-lg"><!></div> <h2 class="h3"> </h2> <p class="opacity-60"> </p>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Auth_carousel($$anchor, $$props) {
	$.push($$props, true);

	const slides = [
		{
			Icon: PaletteIcon,
			title: 'The design layer for Skeleton.',
			description: 'Themes, presets, mesh gradients, UI blocks, and templates — everything you need to ship a beautiful Skeleton app.'
		},

		{
			Icon: WandIcon,
			title: 'Presets for every surface.',
			description: 'A curated library of presets keeps spacing, color, and typography consistent across every screen you build.'
		},

		{
			Icon: SparklesIcon,
			title: 'Mesh gradients on demand.',
			description: 'Generate vibrant, customizable mesh gradients to add depth and atmosphere to any layout in seconds.'
		},

		{
			Icon: BlocksIcon,
			title: 'Production-ready UI blocks.',
			description: 'Drop in headers, heroes, pricing sections, and more — assembled from Skeleton primitives and ready to ship.'
		},

		{
			Icon: LayoutTemplateIcon,
			title: 'Full app templates.',
			description: 'Kickstart your next project with complete templates — fully themed, responsive, and styled with Skeleton.'
		}
	];

	Carousel($$anchor, {
		get slideCount() {
			return slides.length;
		},
		slidesPerPage: 1,
		loop: true,
		autoplay: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => Carousel.ItemGroup, ($$anchor, Carousel_ItemGroup) => {
				Carousel_ItemGroup($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.each(node_1, 17, () => slides, $.index, ($$anchor, slide, i) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							$.component(node_2, () => Carousel.Item, ($$anchor, Carousel_Item) => {
								Carousel_Item($$anchor, {
									index: i,
									class: 'space-y-4 p-4 flex flex-col items-start',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var div = $.first_child(fragment_4);
										var node_3 = $.child(div);

										$.component(node_3, () => $.get(slide).Icon, ($$anchor, slide_Icon) => {
											slide_Icon($$anchor, { class: 'size-6' });
										});

										$.reset(div);

										var h2 = $.sibling(div, 2);
										var text = $.only_child(h2, true);
										var p = $.sibling(h2, 2);
										var text_1 = $.only_child(p, true);

										$.template_effect(() => {
											$.set_text(text, $.get(slide).title);
											$.set_text(text_1, $.get(slide).description);
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node, 2);

			$.component(node_4, () => Carousel.IndicatorGroup, ($$anchor, Carousel_IndicatorGroup) => {
				Carousel_IndicatorGroup($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = $.comment();
						var node_5 = $.first_child(fragment_5);

						{
							const children = ($$anchor, carousel = $.noop) => {
								var fragment_6 = $.comment();
								var node_6 = $.first_child(fragment_6);

								$.each(node_6, 17, () => carousel()().pageSnapPoints, $.index, ($$anchor, _, index) => {
									var fragment_7 = $.comment();
									var node_7 = $.first_child(fragment_7);

									$.component(node_7, () => Carousel.Indicator, ($$anchor, Carousel_Indicator) => {
										Carousel_Indicator($$anchor, { index });
									});

									$.append($$anchor, fragment_7);
								});

								$.append($$anchor, fragment_6);
							};

							$.component(node_5, () => Carousel.Context, ($$anchor, Carousel_Context) => {
								Carousel_Context($$anchor, { children, $$slots: { default: true } });
							});
						}

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}