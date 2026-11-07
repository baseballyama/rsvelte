import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="text-center content-center max-w-lg mx-auto min-h-[70vh] pb-12 flex items-center place-content-center"><div class="flex flex-col w-64 lg:w-80"><!> <div>🍪 Logging in uses Cookies 🍪</div></div></div>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	let isEurope = $.state(false);

	try {
		$.set(isEurope, Intl.DateTimeFormat().resolvedOptions().timeZone.startsWith("Europe/"), true);
	} catch {
		/* continue */
	}

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.children ?? $.noop);

	var div_2 = $.sibling(node, 2);

	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_class(div_2, 1, `mt-8 ${$.get(isEurope) ? 'block' : 'hidden'}`));
	$.append($$anchor, div);
	$.pop();
}