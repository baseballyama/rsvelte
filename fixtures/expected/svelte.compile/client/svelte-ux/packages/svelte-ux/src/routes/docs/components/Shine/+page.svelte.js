import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mdiHome, mdiMagnify, mdiTrashCan } from '@mdi/js';
import { Button, Shine, Tilt } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="text-8xl text-primary border-[12px] border-primary py-2 font-semibold rounded-lg text-center w-[500px]">Shine</div>`);
var root_1 = $.from_html(`<div class="inline-block bg-primary/10 rounded-lg"><!></div>`);
var root_2 = $.from_html(`<div class="text-[9rem] leading-[9rem]">🚀 🧸 🍔 🥨 🍩 🍓 🍒 🪼 🧠 🌎</div>`);
var root_3 = $.from_html(`<div class="text-[9rem] leading-[9rem] grayscale-[100] brightness-50">👻 💀 🧪</div>`);
var root_4 = $.from_html(`<div class="flex items-center gap-2"><!> <!> <!> <!> <!></div>`);
var root_5 = $.from_html(`<img width="180px" class="transition ease-out"/>`);
var root_6 = $.from_html(`<div class="flex items-center justify-center content-center gap-6"></div>`);
var root_7 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!> <h2>Emoji</h2> <!> <h2>Light color</h2> <!> <h2>Button</h2> <!> <h2>with Tilt</h2> <!>`, 1);

export default function _page($$anchor) {
	const images = [
		'https://nelsoncodepen.s3.eu-west-2.amazonaws.com/thb-250-plains.png',
		'https://nelsoncodepen.s3.eu-west-2.amazonaws.com/thb-251-island.png',
		'https://nelsoncodepen.s3.eu-west-2.amazonaws.com/thb-252-swamp.png',
		'https://nelsoncodepen.s3.eu-west-2.amazonaws.com/thb-253-mountain.png',
		'https://nelsoncodepen.s3.eu-west-2.amazonaws.com/thb-254-forest.png'
	];

	var fragment = root_7();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node_1 = $.child(div);

			Shine(node_1, {
				children: ($$anchor, $$slotProps) => {
					var div_1 = root();

					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			Shine($$anchor, {
				depth: 3,
				children: ($$anchor, $$slotProps) => {
					var div_2 = root_2();

					$.append($$anchor, div_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		class: 'bg-neutral-700',
		children: ($$anchor, $$slotProps) => {
			Shine($$anchor, {
				depth: 3,
				lightColor: '#FF0000',
				children: ($$anchor, $$slotProps) => {
					var div_3 = root_3();

					$.append($$anchor, div_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			Shine($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div_4 = root_4();
					var node_5 = $.child(div_4);

					Button(node_5, {
						variant: 'fill',
						color: 'primary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Button');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Button(node_6, {
						get icon() {
							return mdiTrashCan;
						},
						variant: 'fill',
						color: 'danger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Delete');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Button(node_7, {
						get icon() {
							return mdiMagnify;
						},
						variant: 'fill',
						color: 'success',
						class: 'flex-row-reverse',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Search');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Button(node_8, {
						get icon() {
							return mdiHome;
						},
						variant: 'fill',
						color: 'primary',
						class: 'flex-col',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Home');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					Button(node_9, {
						get icon() {
							return mdiHome;
						},
						variant: 'fill',
						color: 'primary',
						class: 'flex-col-reverse',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Home');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					$.reset(div_4);
					$.append($$anchor, div_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_4, 4);

	Preview(node_10, {
		children: ($$anchor, $$slotProps) => {
			Shine($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div_5 = root_6();

					$.each(div_5, 21, () => images, $.index, ($$anchor, image, i) => {
						Tilt($$anchor, {
							class: 'hover:scale-110 transition duration-500',
							children: ($$anchor, $$slotProps) => {
								var img = root_5();

								$.set_attribute(img, 'alt', `example ${i}`);
								$.template_effect(() => $.set_attribute(img, 'src', $.get(image)));
								$.append($$anchor, img);
							},
							$$slots: { default: true }
						});
					});

					$.reset(div_5);
					$.append($$anchor, div_5);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}