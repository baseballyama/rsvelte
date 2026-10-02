import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select, Label } from "flowbite-svelte";

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<option selected="">All</option> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Custom($$anchor) {
	let selected = $.state(void 0);

	let countries = [
		{ value: "us", name: "United States" },
		{ value: "ca", name: "Canada" },
		{ value: "fr", name: "France" }
	];

	var fragment = root_2();
	var node = $.first_child(fragment);

	Label(node, {
		for: 'countries',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select an option');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Select(node_1, {
		id: 'countries',
		class: 'mt-2',
		placeholder: '',
		get value() {
			return $.get(selected);
		},

		set value($$value) {
			$.set(selected, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var option = $.first_child(fragment_1);

			option.value = option.__value = 'all';

			var node_2 = $.sibling(option, 2);

			$.each(node_2, 17, () => countries, $.index, ($$anchor, $$item) => {
				let value = () => $.get($$item).value;
				let name = () => $.get($$item).name;
				var option_1 = root();
				var text_1 = $.only_child(option_1, true);
				var option_1_value = {};

				$.template_effect(() => {
					$.set_text(text_1, name());

					if (option_1_value !== (option_1_value = value())) {
						option_1.value = (option_1.__value = option_1_value) ?? '';
					}
				});

				$.append($$anchor, option_1);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}