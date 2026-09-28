import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-sm leading-4 first-letter:capitalize"> </span>`);
var root_1 = $.from_html(`<div class="flex items-center gap-x-2"><div></div> <!></div>`);

export default function StatusDot($$anchor, $$props) {
	$.push($$props, true);

	let label = $.prop($$props, 'label', 3, false),
		state = $.prop($$props, 'state', 3, "QUEUED");

	const stateObj = {
		QUEUED: "bg-kui-light-gray-400 dark:bg-kui-dark-gray-400",
		BUILDING: "bg-kui-light-amber-600 dark:bg-kui-dark-amber-600",
		ERROR: "bg-kui-light-red-600 dark:bg-kui-dark-red-600",
		READY: "bg-kui-light-green-600 dark:bg-kui-dark-green-600",
		CANCELED: "bg-kui-light-gray-400 dark:bg-kui-dark-gray-400"
	};

	var div = root_1();
	var div_1 = $.child(div);
	var node = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var text = $.only_child(span, true);

			$.template_effect(($0) => $.set_text(text, $0), [() => state().toLowerCase()]);
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if (label()) $$render(consequent);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_class(div_1, 1, `h-2.5 w-2.5 rounded-full ${stateObj[state()] ?? ''}`));
	$.append($$anchor, div);
	$.pop();
}