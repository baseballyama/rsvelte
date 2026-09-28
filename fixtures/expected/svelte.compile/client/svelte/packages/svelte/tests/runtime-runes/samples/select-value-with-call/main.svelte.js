import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select></select>`);

export default function Main($$anchor) {
	function test() {}

	var select = root();
	var select_value;

	$.init_select(select);

	$.template_effect(
		($0) => {
			if (select_value !== (select_value = $0)) {
				(
					select.value = (select.__value = select_value) ?? '',
					$.select_option(select, select_value)
				);
			}
		},
		[() => test()]
	);

	$.append($$anchor, select);
}