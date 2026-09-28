import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="rounded-md h-8 w-8 inline-flex items-center justify-center"> </div>`);
var root_1 = $.from_html(`<button></button>`);

export default function KeyboardShortcut($$anchor, $$props) {
	$.push($$props, true);

	let theme = $.prop($$props, 'theme', 3, 'primary'),
		shortcuts = $.prop($$props, 'shortcuts', 19, () => []);

	const onClick = (event) => {
		$$props.onShortcutClick?.({ event });
	};

	let bgColor = $.derived(() => theme() === 'primary'
		? 'bg-gray-800 dark:bg-dark-mode-gray text-white dark:text-light-gray'
		: 'bg-gray-100 shadow text-black  dark:text-light-gray dark:bg-dark-mode-gray');

	var button = root_1();

	$.each(button, 21, shortcuts, $.index, ($$anchor, shortcut) => {
		var div = root();
		var text = $.only_child(div, true);

		$.template_effect(() => $.set_text(text, $.get(shortcut)));
		$.append($$anchor, div);
	});

	$.reset(button);
	$.template_effect(() => $.set_class(button, 1, `p-2 ${$.get(bgColor)} mx-2 inline-flex gap-1 font-semibold rounded-md hover:scale-110 transition-transform duration-300`));
	$.delegated('click', button, onClick);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);