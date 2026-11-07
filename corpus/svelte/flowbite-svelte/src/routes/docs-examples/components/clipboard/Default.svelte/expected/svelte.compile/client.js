import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Clipboard, Input } from "flowbite-svelte";
import { CheckOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!>`, 1);

export default function Default($$anchor) {
	let value = $.state("npm install flowbite");
	let success = $.state(false);
	var fragment = root();
	var node = $.first_child(fragment);

	Input(node, {
		class: 'w-64',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Clipboard(node_1, {
		class: 'w-24',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		},

		get success() {
			return $.get(success);
		},

		set success($$value) {
			$.set(success, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					CheckOutline($$anchor, {});
				};

				var alternate = ($$anchor) => {
					var text = $.text('Copy');

					$.append($$anchor, text);
				};

				$.if(node_2, ($$render) => {
					if ($.get(success)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}