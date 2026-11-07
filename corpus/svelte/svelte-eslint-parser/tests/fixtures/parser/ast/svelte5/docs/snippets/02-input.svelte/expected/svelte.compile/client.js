import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const figure = ($$anchor, $$arg0) => {
	let src = () => ($$arg0?.()).src;
	let caption = () => ($$arg0?.()).caption;
	let width = () => ($$arg0?.()).width;
	let height = () => ($$arg0?.()).height;
	var figure_1 = root();
	var img = $.child(figure_1);
	var figcaption = $.sibling(img, 2);
	var text = $.only_child(figcaption, true);

	$.reset(figure_1);

	$.template_effect(() => {
		$.set_attribute(img, 'alt', caption());
		$.set_attribute(img, 'src', src());
		$.set_attribute(img, 'width', width());
		$.set_attribute(img, 'height', height());
		$.set_text(text, caption());
	});

	$.append($$anchor, figure_1);
};

var root = $.from_html(`<figure><img/> <figcaption> </figcaption></figure>`);

export default function _2_input($$anchor) {}