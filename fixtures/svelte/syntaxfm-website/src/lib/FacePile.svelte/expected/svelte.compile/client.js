import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img class="svelte-1gjzk3q"/>`);
var root_1 = $.from_html(`<div class="pile svelte-1gjzk3q"></div>`);

export default function FacePile($$anchor, $$props) {
	$.push($$props, true);

	let size = $.prop($$props, 'size', 3, '50px'),
		faces = $.prop($$props, 'faces', 19, () => []);

	var div = root_1();
	let styles;

	$.each(div, 21, faces, $.index, ($$anchor, face) => {
		var img = root();

		$.template_effect(() => {
			$.set_attribute(img, 'src', `https://github.com/${($.get(face).github || 'null') ?? ''}.png`);
			$.set_attribute(img, 'alt', $.get(face).name);
		});

		$.append($$anchor, img);
	});

	$.reset(div);
	$.template_effect(() => styles = $.set_style(div, '', styles, { '--face-size': size(), '--face-count': faces().length }));
	$.append($$anchor, div);
	$.pop();
}