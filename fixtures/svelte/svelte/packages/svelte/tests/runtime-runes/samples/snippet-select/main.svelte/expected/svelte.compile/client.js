import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Select from './Select.svelte';

var root = $.from_html(`<option>--Please choose an option--</option> <option>Dog</option> <option>Cat</option>`, 1);
var root_1 = $.from_html(`<div><label for="pet-select">Choose a pet 1:</label> <!></div> <div><label for="pet-select">Choose a pet 2:</label> <select name="pets" id="pet-select2"><option>--Please choose an option--</option><option>Dog</option><option>Cat</option></select></div>`, 1);

export default function Main($$anchor) {
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	Select(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var option = $.first_child(fragment_1);

			option.value = option.__value = '';

			var option_1 = $.sibling(option, 2);

			option_1.value = option_1.__value = 'dog';

			var option_2 = $.sibling(option_1, 2);

			option_2.value = option_2.__value = 'cat';
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var select = $.sibling($.child(div_1), 2);
	var option_3 = $.child(select);

	option_3.value = option_3.__value = '';

	var option_4 = $.sibling(option_3);

	option_4.value = option_4.__value = 'dog';

	var option_5 = $.sibling(option_4);

	option_5.value = option_5.__value = 'cat';
	$.reset(select);
	$.reset(div_1);
	$.append($$anchor, fragment);
}