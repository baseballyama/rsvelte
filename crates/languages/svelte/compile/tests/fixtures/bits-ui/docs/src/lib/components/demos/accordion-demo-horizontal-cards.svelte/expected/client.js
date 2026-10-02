import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion } from "bits-ui";

var root = $.from_html(`<img class="h-[400px] w-full object-cover"/> <div class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4"><div class="transition-all duration-300 group-data-[state=closed]:translate-y-2 group-data-[state=open]:translate-y-0"><!> <!> <div class="absolute bottom-0 left-0 h-1 w-full transition-all duration-300 group-data-[state=closed]:opacity-0 group-data-[state=open]:opacity-100"></div></div></div>`, 1);

export default function Accordion_demo_horizontal_cards($$anchor) {
	let value = $.state("item-1");

	const items = [
		{
			id: "item-1",
			title: "Mountain Range",
			image: "https://images.unsplash.com/photo-1586589058841-f1264894a260?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3",
			description: "Majestic mountain ranges with snow-capped peaks and lush valleys."
		},

		{
			id: "item-2",
			title: "Ocean Views",
			image: "https://images.unsplash.com/photo-1650300874827-7d39bc9276ea?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3",
			description: "Serene ocean scenes with crashing waves, beautiful sunsets, and sandy beaches."
		},

		{
			id: "item-3",
			title: "Forest Retreats",
			image: "https://images.unsplash.com/photo-1693297490324-37ee6301f6c8?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3",
			description: "Dense forests with towering trees, abundant wildlife, and peaceful streams."
		}
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Accordion.Root, ($$anchor, Accordion_Root) => {
		Accordion_Root($$anchor, {
			type: 'single',
			orientation: 'horizontal',
			class: 'flex h-[400px] w-full gap-2 sm:flex-row',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, () => items, (item) => item.id, ($$anchor, item) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Accordion.Item, ($$anchor, Accordion_Item) => {
						Accordion_Item($$anchor, {
							get value() {
								return $.get(item).id;
							},
							class: 'ring-primary/70 relative cursor-pointer overflow-hidden rounded-lg transition-all duration-500 ease-in-out data-[state=closed]:w-[20%] data-[state=open]:w-[100%] md:data-[state=closed]:w-[10%] [&:has(:focus-visible)]:ring-2',
							onclick: () => $.set(value, $.get(item).id, true),
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var img = $.first_child(fragment_3);
								var div = $.sibling(img, 2);
								var div_1 = $.child(div);
								var node_3 = $.child(div_1);

								$.component(node_3, () => Accordion.Header, ($$anchor, Accordion_Header) => {
									Accordion_Header($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
												Accordion_Trigger($$anchor, {
													class: 'focus-override text-left font-bold text-white transition-all duration-300 focus-visible:!outline-none data-[state=open]:mb-2 data-[state=closed]:text-sm data-[state=open]:text-base data-[state=closed]:opacity-0 data-[state=open]:opacity-100 md:data-[state=open]:text-xl',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text();

														$.template_effect(() => $.set_text(text, $.get(item).title));
														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								var node_5 = $.sibling(node_3, 2);

								$.component(node_5, () => Accordion.Content, ($$anchor, Accordion_Content) => {
									Accordion_Content($$anchor, {
										forceMount: true,
										class: 'max-h-0 overflow-hidden text-white/90 transition-all duration-700 data-[state=open]:max-h-[100px] data-[state=open]:text-xs data-[state=closed]:opacity-0 data-[state=open]:opacity-100 md:data-[state=open]:text-base',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text();

											$.template_effect(() => $.set_text(text_1, $.get(item).description));
											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								});

								$.next(2);
								$.reset(div_1);
								$.reset(div);

								$.template_effect(() => {
									$.set_attribute(img, 'src', $.get(item).image);
									$.set_attribute(img, 'alt', $.get(item).title);
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}