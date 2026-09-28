import * as $ from 'svelte/internal/server';
import { Accordion } from "bits-ui";

export default function Accordion_demo_horizontal_cards($$renderer) {
	let value = "item-1";

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

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Accordion.Root) {
			$$renderer.push('<!--[-->');

			Accordion.Root($$renderer, {
				type: 'single',
				orientation: 'horizontal',
				class: 'flex h-[400px] w-full gap-2 sm:flex-row',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(items);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let item = each_array[$$index];

						if (Accordion.Item) {
							$$renderer.push('<!--[-->');

							Accordion.Item($$renderer, {
								value: item.id,
								class: 'ring-primary/70 relative cursor-pointer overflow-hidden rounded-lg transition-all duration-500 ease-in-out data-[state=closed]:w-[20%] data-[state=open]:w-[100%] md:data-[state=closed]:w-[10%] [&:has(:focus-visible)]:ring-2',
								onclick: () => value = item.id,
								children: ($$renderer) => {
									$$renderer.push(`<img${$.attr('src', item.image)}${$.attr('alt', item.title)} class="h-[400px] w-full object-cover"/> <div class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4"><div class="transition-all duration-300 group-data-[state=closed]:translate-y-2 group-data-[state=open]:translate-y-0">`);

									if (Accordion.Header) {
										$$renderer.push('<!--[-->');

										Accordion.Header($$renderer, {
											children: ($$renderer) => {
												if (Accordion.Trigger) {
													$$renderer.push('<!--[-->');

													Accordion.Trigger($$renderer, {
														class: 'focus-override text-left font-bold text-white transition-all duration-300 focus-visible:!outline-none data-[state=open]:mb-2 data-[state=closed]:text-sm data-[state=open]:text-base data-[state=closed]:opacity-0 data-[state=open]:opacity-100 md:data-[state=open]:text-xl',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(item.title)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Accordion.Content) {
										$$renderer.push('<!--[-->');

										Accordion.Content($$renderer, {
											forceMount: true,
											class: 'max-h-0 overflow-hidden text-white/90 transition-all duration-700 data-[state=open]:max-h-[100px] data-[state=open]:text-xs data-[state=closed]:opacity-0 data-[state=open]:opacity-100 md:data-[state=open]:text-base',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(item.description)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` <div class="absolute bottom-0 left-0 h-1 w-full transition-all duration-300 group-data-[state=closed]:opacity-0 group-data-[state=open]:opacity-100"></div></div></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}