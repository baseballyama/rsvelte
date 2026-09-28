import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar, AvatarImage, AvatarFallback } from "$lib/components/ui/avatar";
import { Card, CardContent, CardHeader } from "$lib/components/ui/card";

var root = $.from_html(`<img class="h-6 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/nike.svg" alt="Nike Logo" height="24" width="auto"/>`);
var root_1 = $.from_html(`<!> <!>`, 1);

var root_2 = $.from_html(`<blockquote class="grid h-full grid-rows-[1fr_auto] gap-6"><p class="text-xl font-medium">Tailus has transformed the way I develop web applications. Their
							extensive collection of UI components, blocks, and templates has
							significantly accelerated my workflow. The flexibility to customize
							every aspect allows me to create unique user experiences. Tailus is a
							game-changer for modern web development</p> <div class="grid grid-cols-[auto_1fr] items-center gap-3"><!> <div><cite class="text-sm font-medium">Shekinah Tshiokufila</cite> <span class="block text-sm text-muted-foreground">Software Ingineer</span></div></div></blockquote>`);

var root_3 = $.from_html(`<blockquote class="grid h-full grid-rows-[1fr_auto] gap-6"><p class="text-xl font-medium">Tailus is really extraordinary and very practical, no need to break your
							head. A real gold mine.</p> <div class="grid grid-cols-[auto_1fr] items-center gap-3"><!> <div><cite class="text-sm font-medium">Jonathan Yombo</cite> <span class="block text-sm text-muted-foreground">Software Ingineer</span></div></div></blockquote>`);

var root_4 = $.from_html(`<blockquote class="grid h-full grid-rows-[1fr_auto] gap-6"><p>Great work on tailfolio template. This is one of the best personal
							website that I have seen so far!</p> <div class="grid [grid-template-columns:auto_1fr] items-center gap-3"><!> <div><cite class="text-sm font-medium">Yucel Faruksahan</cite> <span class="block text-sm text-muted-foreground">Creator, Tailkits</span></div></div></blockquote>`);

var root_5 = $.from_html(`<blockquote class="grid h-full grid-rows-[1fr_auto] gap-6"><p>Great work on tailfolio template. This is one of the best personal
							website that I have seen so far!</p> <div class="grid grid-cols-[auto_1fr] gap-3"><!> <div><p class="text-sm font-medium">Rodrigo Aguilar</p> <span class="block text-sm text-muted-foreground">Creator, TailwindAwesome</span></div></div></blockquote>`);

var root_6 = $.from_html(`<section class="py-16 md:py-32"><div class="mx-auto max-w-6xl space-y-8 px-6 md:space-y-16"><div class="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12"><h2 class="text-4xl font-medium lg:text-5xl">Build by makers, loved by thousand developers</h2> <p>Gemini is evolving to be more than just the models. It supports an entire to the
				APIs and platforms helping developers and businesses innovate.</p></div> <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-rows-2"><!> <!> <!> <!></div></div></section>`);

export default function Testimonial_one($$anchor) {
	var section = root_6();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Card(node, {
		class: 'grid grid-rows-[auto_1fr] gap-8 sm:col-span-2 sm:p-6 lg:row-span-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			CardHeader(node_1, {
				children: ($$anchor, $$slotProps) => {
					var img = root();

					$.append($$anchor, img);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			CardContent(node_2, {
				children: ($$anchor, $$slotProps) => {
					var blockquote = root_2();
					var div_2 = $.sibling($.child(blockquote), 2);
					var node_3 = $.child(div_2);

					Avatar(node_3, {
						class: 'size-12',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_4 = $.first_child(fragment_1);

							AvatarImage(node_4, {
								src: 'https://tailus.io/images/reviews/shekinah.webp',
								alt: 'Shekinah Tshiokufila',
								height: '400',
								width: '400',
								loading: 'lazy'
							});

							var node_5 = $.sibling(node_4, 2);

							AvatarFallback(node_5, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('ST');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});

					$.next(2);
					$.reset(div_2);
					$.reset(blockquote);
					$.append($$anchor, blockquote);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node, 2);

	Card(node_6, {
		class: 'md:col-span-2',
		children: ($$anchor, $$slotProps) => {
			CardContent($$anchor, {
				class: 'h-full pt-6',
				children: ($$anchor, $$slotProps) => {
					var blockquote_1 = root_3();
					var div_3 = $.sibling($.child(blockquote_1), 2);
					var node_7 = $.child(div_3);

					Avatar(node_7, {
						class: 'size-12',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_8 = $.first_child(fragment_3);

							AvatarImage(node_8, {
								src: 'https://tailus.io/images/reviews/jonathan.webp',
								alt: 'Jonathan Yombo',
								height: '400',
								width: '400',
								loading: 'lazy'
							});

							var node_9 = $.sibling(node_8, 2);

							AvatarFallback(node_9, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('JY');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					$.next(2);
					$.reset(div_3);
					$.reset(blockquote_1);
					$.append($$anchor, blockquote_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_6, 2);

	Card(node_10, {
		children: ($$anchor, $$slotProps) => {
			CardContent($$anchor, {
				class: 'h-full pt-6',
				children: ($$anchor, $$slotProps) => {
					var blockquote_2 = root_4();
					var div_4 = $.sibling($.child(blockquote_2), 2);
					var node_11 = $.child(div_4);

					Avatar(node_11, {
						class: 'size-12',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_1();
							var node_12 = $.first_child(fragment_5);

							AvatarImage(node_12, {
								src: 'https://tailus.io/images/reviews/yucel.webp',
								alt: 'Yucel Faruksahan',
								height: '400',
								width: '400',
								loading: 'lazy'
							});

							var node_13 = $.sibling(node_12, 2);

							AvatarFallback(node_13, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('YF');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					$.next(2);
					$.reset(div_4);
					$.reset(blockquote_2);
					$.append($$anchor, blockquote_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_10, 2);

	Card(node_14, {
		class: 'card variant-mixed',
		children: ($$anchor, $$slotProps) => {
			CardContent($$anchor, {
				class: 'h-full pt-6',
				children: ($$anchor, $$slotProps) => {
					var blockquote_3 = root_5();
					var div_5 = $.sibling($.child(blockquote_3), 2);
					var node_15 = $.child(div_5);

					Avatar(node_15, {
						class: 'size-12',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_1();
							var node_16 = $.first_child(fragment_7);

							AvatarImage(node_16, {
								src: 'https://tailus.io/images/reviews/rodrigo.webp',
								alt: 'Rodrigo Aguilar',
								height: '400',
								width: '400',
								loading: 'lazy'
							});

							var node_17 = $.sibling(node_16, 2);

							AvatarFallback(node_17, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('YF');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					$.next(2);
					$.reset(div_5);
					$.reset(blockquote_3);
					$.append($$anchor, blockquote_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}