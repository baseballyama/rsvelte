import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<option>Extra</option>`);
var root_1 = $.from_html(`<select><option>Choose an option</option><option>First</option><!></select>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let show_extra = false;
	const attributes = { 'aria-label': 'choice' };

	function toggle() {
		show_extra = !show_extra;
	}

	var $$exports = { toggle };
	var select = root_1();

	$.attribute_effect(select, () => ({ ...attributes }));

	var option = $.child(select);

	option.value = option.__value = '';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'first';

	var node = $.sibling(option_1);

	{
		var consequent = ($$anchor) => {
			var option_2 = root();

			option_2.value = option_2.__value = 'extra';
			$.append($$anchor, option_2);
		};

		$.if(node, ($$render) => {
			if (show_extra) $$render(consequent);
		});
	}

	$.reset(select);
	$.append($$anchor, select);

	return $.pop($$exports);
}