import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<select><option>please choose</option><!></select>`);

export default function Main($$anchor) {
	let available = [1, 2, 3, 4, 5];
	let taken = [2, 4];
	var select = root_1();
	var option = $.child(select);

	option.value = option.__value = 'please choose';

	var node = $.sibling(option);

	$.each(node, 17, () => available, $.index, ($$anchor, a) => {
		var option_1 = root();
		var text = $.only_child(option_1, true);
		var option_1_value = {};

		$.template_effect(
			($0) => {
				option_1.disabled = $0;
				$.set_text(text, $.get(a));

				if (option_1_value !== (option_1_value = $.get(a))) {
					option_1.value = (option_1.__value = option_1_value) ?? '';
				}
			},
			[() => !!taken.find((f) => f == $.get(a))]
		);

		$.append($$anchor, option_1);
	});

	$.reset(select);
	$.append($$anchor, select);
}