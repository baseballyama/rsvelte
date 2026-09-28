import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button type="button" class="hover:text-primary-700 me-2 flex items-center rounded-lg border border-gray-200 bg-white p-2 text-xs font-medium text-gray-700 hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-gray-300 focus:outline-hidden dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-500"><!> <span class="sr-only">Toggle direction</span></button>`);

export default function ExampleRTL($$anchor, $$props) {
	$.push($$props, true);

	let rtl = $.prop($$props, 'rtl', 15);

	if (rtl() === undefined && document.dir) {
		rtl(document.dir);
	}

	const transitions = { ltr: "rtl", rtl: "ltr", auto: "rtl" };

	function toggle() {
		rtl(transitions[rtl() ?? "auto"]);
	}

	var button = root();
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var text = $.text('LTR');

			$.append($$anchor, text);
		};

		var alternate = ($$anchor) => {
			var text_1 = $.text('RTL');

			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if (rtl() === "rtl") $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.next(2);
	$.reset(button);
	$.delegated('click', button, toggle);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);