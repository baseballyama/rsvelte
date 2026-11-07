import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RedThing from './RedThing.svelte';
import GreenThing from './GreenThing.svelte';
import BlueThing from './BlueThing.svelte';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<select></select> <!>`, 1);

export default function Svelte_component_input($$anchor) {
	const options = [
		{ color: 'red', component: RedThing },
		{ color: 'green', component: GreenThing },
		{ color: 'blue', component: BlueThing }
	];

	let selected = options[0];
	var fragment = root_1();
	var select = $.first_child(fragment);

	$.each(select, 21, () => options, $.index, ($$anchor, option) => {
		var option_1 = root();
		var text = $.only_child(option_1, true);
		var option_1_value = {};

		$.template_effect(() => {
			$.set_text(text, $.get(option).color);

			if (option_1_value !== (option_1_value = $.get(option))) {
				option_1.value = (option_1.__value = option_1_value) ?? '';
			}
		});

		$.append($$anchor, option_1);
	});

	$.reset(select);
	$.init_select(select);

	var node = $.sibling(select, 2);

	$.component(node, () => selected.component, ($$anchor, $$component) => {
		$$component($$anchor, {});
	});

	$.bind_select_value(select, () => selected, ($$value) => selected = $$value);
	$.append($$anchor, fragment);
}