import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Shine, Tilt } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';
import Blockquote from '$docs/Blockquote.svelte';

var root = $.from_html(`<img width="180px" class="transition ease-out"/>`);
var root_1 = $.from_html(`<div class="flex items-center justify-center content-center gap-6"></div>`);
var root_2 = $.from_html(`<div class="flex flex-wrap items-center justify-center content-center gap-6"></div>`);
var root_3 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!> <h2>Set brightness</h2> <!> <h2>with Shine</h2> <!> <h2>Change perspective amount</h2> <!> <h2>maxRotation</h2> <!> <h2>flex-wrap</h2> <!> <!>`, 1);

export default function _page($$anchor) {
	const images = [
		'https://nelsoncodepen.s3.eu-west-2.amazonaws.com/thb-250-plains.png',
		'https://nelsoncodepen.s3.eu-west-2.amazonaws.com/thb-251-island.png',
		'https://nelsoncodepen.s3.eu-west-2.amazonaws.com/thb-252-swamp.png',
		'https://nelsoncodepen.s3.eu-west-2.amazonaws.com/thb-253-mountain.png',
		'https://nelsoncodepen.s3.eu-west-2.amazonaws.com/thb-254-forest.png'
	];

	var fragment = root_3();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var div = root_1();

			$.each(div, 21, () => images, $.index, ($$anchor, image, i) => {
				Tilt($$anchor, {
					class: 'hover:scale-110 transition duration-500',
					children: ($$anchor, $$slotProps) => {
						var img = root();

						$.set_attribute(img, 'alt', `example ${i}`);
						$.template_effect(() => $.set_attribute(img, 'src', $.get(image)));
						$.append($$anchor, img);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_1();

			$.each(div_1, 21, () => images, $.index, ($$anchor, image, i) => {
				Tilt($$anchor, {
					class: 'hover:scale-110 transition duration-500',
					setBrightness: true,
					children: ($$anchor, $$slotProps) => {
						var img_1 = root();

						$.set_attribute(img_1, 'alt', `example ${i}`);
						$.template_effect(() => $.set_attribute(img_1, 'src', $.get(image)));
						$.append($$anchor, img_1);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			Shine($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div_2 = root_1();

					$.each(div_2, 21, () => images, $.index, ($$anchor, image, i) => {
						Tilt($$anchor, {
							class: 'hover:scale-110 transition duration-500',
							children: ($$anchor, $$slotProps) => {
								var img_2 = root();

								$.set_attribute(img_2, 'alt', `example ${i}`);
								$.template_effect(() => $.set_attribute(img_2, 'src', $.get(image)));
								$.append($$anchor, img_2);
							},
							$$slots: { default: true }
						});
					});

					$.reset(div_2);
					$.append($$anchor, div_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			var div_3 = root_1();

			$.each(div_3, 21, () => images, $.index, ($$anchor, image, i) => {
				Tilt($$anchor, {
					class: 'hover:scale-110 transition duration-500 [perspective:300px]',
					children: ($$anchor, $$slotProps) => {
						var img_3 = root();

						$.set_attribute(img_3, 'alt', `example ${i}`);
						$.template_effect(() => $.set_attribute(img_3, 'src', $.get(image)));
						$.append($$anchor, img_3);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			var div_4 = root_1();

			$.each(div_4, 21, () => images, $.index, ($$anchor, image, i) => {
				Tilt($$anchor, {
					class: 'hover:scale-110 transition duration-500',
					maxRotation: 40,
					children: ($$anchor, $$slotProps) => {
						var img_4 = root();

						$.set_attribute(img_4, 'alt', `example ${i}`);
						$.template_effect(() => $.set_attribute(img_4, 'src', $.get(image)));
						$.append($$anchor, img_4);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_4);
			$.append($$anchor, div_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			var div_5 = root_2();

			$.each(div_5, 21, () => images, $.index, ($$anchor, image, i) => {
				Tilt($$anchor, {
					class: 'hover:scale-110 transition duration-500',
					children: ($$anchor, $$slotProps) => {
						var img_5 = root();

						$.set_attribute(img_5, 'alt', `example ${i}`);
						$.template_effect(() => $.set_attribute(img_5, 'src', $.get(image)));
						$.append($$anchor, img_5);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Blockquote(node_6, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Magic: The Gathering card images are copyright Wizards of the Coast, LLC.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}