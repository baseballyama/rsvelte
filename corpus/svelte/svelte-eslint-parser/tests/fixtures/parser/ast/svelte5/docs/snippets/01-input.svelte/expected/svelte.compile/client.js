import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const figure = ($$anchor, image = $.noop) => {
	var figure_1 = root();
	var img = $.child(figure_1);
	var figcaption = $.sibling(img, 2);
	var text = $.only_child(figcaption, true);

	$.reset(figure_1);

	$.template_effect(() => {
		$.set_attribute(img, 'src', image().src);
		$.set_attribute(img, 'alt', image().caption);
		$.set_attribute(img, 'width', image().width);
		$.set_attribute(img, 'height', image().height);
		$.set_text(text, image().caption);
	});

	$.append($$anchor, figure_1);
};

var root = $.from_html(`<figure><img/> <figcaption> </figcaption></figure>`);
var root_1 = $.from_html(`<a><!></a>`);

export default function _1_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => images, $.index, ($$anchor, image) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			var consequent = ($$anchor) => {
				var a = root_1();
				var node_2 = $.child(a);

				figure(node_2, () => image);
				$.reset(a);
				$.template_effect(() => $.set_attribute(a, 'href', image.href));
				$.append($$anchor, a);
			};

			var alternate = ($$anchor) => {
				figure($$anchor, () => image);
			};

			$.if(node_1, ($$render) => {
				if (image.href) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}