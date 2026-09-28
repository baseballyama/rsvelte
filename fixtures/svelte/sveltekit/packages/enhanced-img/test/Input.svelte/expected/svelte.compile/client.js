import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import manual_image1 from './no.png';
import manual_image2 from './no.svg';

var root = $.from_html(`<enhanced:img alt="opt-in test"></enhanced:img>`);
var root_1 = $.from_html(` <img src="./dev.png" alt="non-enhanced test"/> <enhanced:img src="./dev.png" alt="dev test"></enhanced:img> <div><enhanced:img src="./dev.png" alt="nested test"></enhanced:img></div> <enhanced:img src="./prod.png" alt="production test"></enhanced:img> <enhanced:img src="./dev.png" width="5" height="10" alt="dimensions test"></enhanced:img> <enhanced:img src="./dev.png?blur=5" alt="directive test"></enhanced:img> <enhanced:img></enhanced:img> <enhanced:img src="./dev.png?w=1024,640,320" sizes="(min-width: 60rem) 80vw, (min-width: 40rem) 90vw, 100vw" alt="sizes test"></enhanced:img> <enhanced:img src="./dev.png" alt="event handler test"></enhanced:img> <enhanced:img src="#lib/dev.png" alt="alias test"></enhanced:img> <enhanced:img src="/src/dev.png" alt="absolute path test"></enhanced:img> <enhanced:img alt="attribute shorthand test"></enhanced:img> <!> <!> <picture><source src="./dev.avif"/> <source srcset="./dev.avif 500v ./bar.avif 100v"/> <source srcset="./dev.avif, ./bar.avif 1v"/></picture>`, 1);

export default function Input($$anchor) {
	const src = manual_image1;
	const images = [manual_image1, manual_image2];
	const get_image = (image_key) => images[image_key];
	let foo = 'bar';

	$.next();

	var fragment = root_1();
	var text = $.first_child(fragment);
	var enhanced_img = $.sibling(text, 13);

	$.attribute_effect(enhanced_img, () => ({ src: './dev.png', ...{ foo }, alt: 'spread attributes test' }));

	var enhanced_img_1 = $.sibling(enhanced_img, 4);
	var enhanced_img_2 = $.sibling(enhanced_img_1, 6);
	var node = $.sibling(enhanced_img_2, 2);

	$.each(node, 17, () => images, $.index, ($$anchor, image) => {
		var enhanced_img_3 = root();

		$.template_effect(() => $.set_attribute(enhanced_img_3, 'src', $.get(image)));
		$.append($$anchor, enhanced_img_3);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 17, () => images, $.index, ($$anchor, _, i) => {
		var enhanced_img_4 = root();

		$.template_effect(($0) => $.set_attribute(enhanced_img_4, 'src', $0), [() => get_image(i)]);
		$.append($$anchor, enhanced_img_4);
	});

	$.next(2);

	$.template_effect(() => {
		$.set_text(text, `${foo ?? ''} `);
		$.set_attribute(enhanced_img_2, 'src', src);
	});

	$.delegated('click', enhanced_img_1, () => foo = 'clicked an image!');
	$.append($$anchor, fragment);
}

$.delegate(['click']);