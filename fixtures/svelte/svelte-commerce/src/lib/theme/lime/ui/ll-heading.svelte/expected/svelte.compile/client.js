import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="ll-heading-sub svelte-1t1774b"> </p>`);
var root_1 = $.from_html(`<div class="ll-heading"><!> <!></div>`);

export default function Ll_heading($$anchor, $$props) {
	/**
	 * Lime section heading — regular-weight serif in plum, with an
	 * optional subheading. Mirrors the source "Shop by Category" treatment:
	 * centered by default, 24px serif title, 16px body-tone subtitle.
	 */
	let align = $.prop($$props, 'align', 3, 'center'),
		as = $.prop($$props, 'as', 3, 'h2');

	var div = root_1();
	var node = $.child(div);

	$.element(node, as, false, ($$element, $$anchor) => {
		$.set_class($$element, 0, 'll-heading-title svelte-1t1774b');

		var fragment = $.comment();
		var node_1 = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				$.snippet(node_2, () => $$props.children);
				$.append($$anchor, fragment_1);
			};

			var alternate = ($$anchor) => {
				var text = $.text();

				$.template_effect(() => $.set_text(text, $$props.title));
				$.append($$anchor, text);
			};

			$.if(node_1, ($$render) => {
				if ($$props.children) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	});

	var node_3 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var p = root();
			var text_1 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_1, $$props.subtitle));
			$.append($$anchor, p);
		};

		$.if(node_3, ($$render) => {
			if ($$props.subtitle) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_style(div, `text-align: ${align() ?? ''};`));
	$.append($$anchor, div);
}