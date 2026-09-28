import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from "$app/paths";

var root = $.from_html(`<ol><li><a>Hello world</a></li> <li><a>Remounting canvas</a></li> <li><a>Oversized canvas</a></li> <li><a>Landing page with bubbles</a></li> <li><a>Landing page with a halo</a></li> <li><a>Slider component</a></li></ol>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var ol = root();
	var li = $.child(ol);
	var a = $.only_child(li);
	var li_1 = $.sibling(li, 2);
	var a_1 = $.only_child(li_1);
	var li_2 = $.sibling(li_1, 2);
	var a_2 = $.only_child(li_2);
	var li_3 = $.sibling(li_2, 2);
	var a_3 = $.only_child(li_3);
	var li_4 = $.sibling(li_3, 2);
	var a_4 = $.only_child(li_4);
	var li_5 = $.sibling(li_4, 2);
	var a_5 = $.only_child(li_5);

	$.reset(ol);

	$.template_effect(
		($0, $1, $2, $3, $4, $5) => {
			$.set_attribute(a, 'href', $0);
			$.set_attribute(a_1, 'href', $1);
			$.set_attribute(a_2, 'href', $2);
			$.set_attribute(a_3, 'href', $3);
			$.set_attribute(a_4, 'href', $4);
			$.set_attribute(a_5, 'href', $5);
		},
		[
			() => resolve("/hello-world"),
			() => resolve("/remount"),
			() => resolve("/oversized-canvas"),
			() => resolve("/landing-page-bubbles"),
			() => resolve("/landing-page-halo"),
			() => resolve("/slider")
		]
	);

	$.append($$anchor, ol);
	$.pop();
}