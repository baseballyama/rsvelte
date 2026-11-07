import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from "$app/paths";

var root = $.from_html(`<ul><li><a>WebGL</a></li> <li><a>WebGPU</a></li></ul>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var ul = root();
	var li = $.child(ul);
	var a = $.only_child(li);
	var li_1 = $.sibling(li, 2);
	var a_1 = $.only_child(li_1);

	$.reset(ul);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(a, 'href', $0);
			$.set_attribute(a_1, 'href', $1);
		},
		[
			() => resolve("/remount/webgl"),
			() => resolve("/remount/webgpu")
		]
	);

	$.append($$anchor, ul);
	$.pop();
}