import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="flex flex-col items-center justify-center space-y-3 text-center"><a class="dark:outline-svelte-700/80 group peer outline-svelte/40 relative grid place-items-center overflow-hidden rounded-xl outline-[0.5px] outline-solid sm:flex"><enhanced:img class="h-[198px] w-[268px] object-cover dark:hidden" loading="eager" fetchpriority="high" sizes="(min-width:1920px) 1280px, (min-width:1080px) 640px, (min-width:768px) 400px"></enhanced:img> <enhanced:img class="hidden h-[198px] w-[268px] object-cover dark:block" loading="eager" fetchpriority="high" sizes="(min-width:1920px) 1280px, (min-width:1080px) 640px, (min-width:768px) 400px"></enhanced:img> <span class="sr-only"> </span> <div class="bg-svelte/60 group-hover:bg-svelte/80 absolute inset-0 mix-blend-overlay transition-colors"></div></a> <div class="mb-0.5 [&amp;_a]:peer-hover:underline"><!></div></div>`);

export default function Category_card($$anchor, $$props) {
	$.push($$props, true);

	const images = import.meta.glob(['/src/lib/assets/thumbs/*.png'], {
		eager: true,
		import: 'default',
		query: { enhanced: true, w: '1280;640;400' }
	});

	function getImage(category) {
		const darkVersion = images[`/src/lib/assets/thumbs/${category}-dark.png`];
		const lightVersion = images[`/src/lib/assets/thumbs/${category}.png`];

		if (!darkVersion || !lightVersion) {
			throw new Error(`No image found for ${category}`);
		}

		return { dark: darkVersion, light: lightVersion };
	}

	const imageBasePath = $.derived(() => getImage($$props.slug));
	var div = root();
	var a = $.child(div);

	$.set_attribute(a, 'tabindex', -1);

	var enhanced_img = $.child(a);
	var enhanced_img_1 = $.sibling(enhanced_img, 2);
	var span = $.sibling(enhanced_img_1, 2);
	var text = $.only_child(span, true);

	$.next(2);
	$.reset(a);

	var div_1 = $.sibling(a, 2);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.details);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(a, 'href', `/${$$props.slug ?? ''}`);
		$.set_attribute(enhanced_img, 'src', $.get(imageBasePath).light);
		$.set_attribute(enhanced_img, 'alt', $$props.alt);
		$.set_attribute(enhanced_img_1, 'src', $.get(imageBasePath).dark);
		$.set_attribute(enhanced_img_1, 'alt', $$props.alt);
		$.set_text(text, $$props.alt);
	});

	$.append($$anchor, div);
	$.pop();
}