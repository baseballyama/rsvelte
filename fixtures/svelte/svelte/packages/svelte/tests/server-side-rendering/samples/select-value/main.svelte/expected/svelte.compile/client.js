import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select><option>--Please choose an option--</option><option>Dog</option><option>Cat</option></select>`);

export default function Main($$anchor) {
	var select = root();
	var option = $.child(select);

	option.value = option.__value = '';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'dog';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 'cat';
	$.reset(select);
	select.value = select.__value = 'dog';
	$.append($$anchor, select);
}