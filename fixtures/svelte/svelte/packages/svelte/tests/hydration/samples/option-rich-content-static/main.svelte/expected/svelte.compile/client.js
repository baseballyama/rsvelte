import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var option_content = $.from_html(`<strong>Bold</strong> Option`, 1);
var option_content_1 = $.from_html(`<em>Italic</em> Option`, 1);
var root = $.from_html(`<select><option><!></option><option><!></option><option>Plain Option</option></select>`);

export default function Main($$anchor) {
	var select = root();
	var option = $.child(select);

	$.customizable_select(option, () => {
		var anchor = $.child(option);
		var fragment = option_content();

		$.next();
		$.append(anchor, fragment);
	});

	option.value = option.__value = 'a';

	var option_1 = $.sibling(option);

	$.customizable_select(option_1, () => {
		var anchor_1 = $.child(option_1);
		var fragment_1 = option_content_1();

		$.next();
		$.append(anchor_1, fragment_1);
	});

	option_1.value = option_1.__value = 'b';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 'c';
	$.reset(select);
	$.append($$anchor, select);
}