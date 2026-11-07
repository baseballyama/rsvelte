import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { VirtualMasonry, Heading, P } from "$lib";
import { Spinner } from "flowbite-svelte";

var root = $.from_html(`<div class="flex h-96 items-center justify-center"><!></div>`);
var root_1 = $.from_html(`<div class="group relative h-full"><img class="h-full w-full object-cover transition-opacity duration-500" loading="lazy" decoding="async"/> <div class="absolute right-0 bottom-0 left-0 rounded-b-lg bg-gradient-to-t from-black/70 to-transparent p-3 text-white opacity-0 transition-opacity group-hover:opacity-100"><p class="truncate text-sm font-medium"> </p></div></div>`);
var root_2 = $.from_html(`<div class="container mx-auto max-w-5xl px-4 py-8"><!> <!> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// Track if images are loaded (for client-side navigation)
	let imagesLoaded = $.state(false);

	$.user_effect(() => {
		if ($$props.data.images.length > 0) {
			$.set(imagesLoaded, true);
		}
	});

	function getImageHeight(image, _index) {
		const estimatedColumnWidth = 300;

		// Add extra height for padding
		const imageHeight = image.height / image.width * estimatedColumnWidth;

		return imageHeight + 16; // Add 16px for padding (p-2 = 8px top + 8px bottom)
	}

	var div = root_2();
	var node = $.child(div);

	Heading(node, {
		tag: 'h1',
		class: 'mb-6 text-3xl font-bold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Virtual Masonry Image Gallery (50 images)');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('A virtualized Svelte component rendering an efficient masonry/Pinterest layout. It calculates item positions and uses windowing (overscan) to display only visible items from a large dataset,\n    optimizing performance.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_3 = $.child(div_1);

			Spinner(node_3, { size: '12' });
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var alternate = ($$anchor) => {
			{
				const children = ($$anchor, image = $.noop, _index = $.noop) => {
					var div_2 = root_1();
					var img = $.child(div_2);
					var div_3 = $.sibling(img, 2);
					var p = $.child(div_3);
					var text_2 = $.only_child(p);

					$.reset(div_3);
					$.reset(div_2);

					$.template_effect(() => {
						$.set_attribute(img, 'src', image().url);
						$.set_attribute(img, 'alt', image().alt);
						$.set_text(text_2, `Photo by ${image().author ?? ''}`);
					});

					$.append($$anchor, div_2);
				};

				VirtualMasonry($$anchor, {
					get items() {
						return $$props.data.images;
					},
					columns: 2,
					gap: 16,
					height: 800,
					overscan: 200,
					getItemHeight: getImageHeight,
					classes: { item: "p-2" },
					children,
					$$slots: { default: true }
				});
			}
		};

		$.if(node_2, ($$render) => {
			if (!$.get(imagesLoaded) || $$props.data.images.length === 0) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}