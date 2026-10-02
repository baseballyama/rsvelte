import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<option>-1</option>`);
var root_2 = $.from_html(`<select><!></select>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let promise = getNumbers();
	let selected = 2;

	async function getNumbers() {
		await new Promise((resolve) => setTimeout(resolve, 100));

		return [1, 2, 3];
	}

	var select = root_2();
	var node = $.child(select);

	$.await(
		node,
		() => promise,
		($$anchor) => {
			var option_1 = root_1();

			$.append($$anchor, option_1);
		},
		($$anchor, numbers) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => $.get(numbers), $.index, ($$anchor, number) => {
				var option = root();
				var text = $.only_child(option, true);
				var option_value = {};

				$.template_effect(() => {
					$.set_text(text, $.get(number));

					if (option_value !== (option_value = $.get(number))) {
						option.__value = option_value;
					}
				});

				$.append($$anchor, option);
			});

			$.append($$anchor, fragment);
		}
	);

	$.reset(select);
	$.init_select(select);
	$.bind_select_value(select, () => selected, ($$value) => selected = $$value);
	$.append($$anchor, select);
	$.pop();
}