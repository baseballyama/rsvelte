import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Toggle } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Disabled($$anchor) {
	let isDisabled = $.state(false);
	let checked = $.state(false);

	const handleClick = () => {
		$.set(isDisabled, !$.get(isDisabled));
	};

	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		class: 'w-48',
		onclick: handleClick,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `Disabled: ${$.get(isDisabled) ? "True" : "False"}`));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Toggle(node_1, {
		class: 'mt-3',
		get disabled() {
			return $.get(isDisabled);
		},

		get checked() {
			return $.get(checked);
		},

		set checked($$value) {
			$.set(checked, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, `Disabled: ${$.get(isDisabled) ?? ''}`));
			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}