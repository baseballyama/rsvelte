import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioButtonGroup, CheckboxGroup, Select, Text } from "@svar-ui/svelte-core";
import { getData } from "../data";

var root = $.from_html(`<div class="column svelte-1b19rd6"><!> <!> <!> <div class="checkbox-group svelte-1b19rd6"><!></div></div>`);

export default function RadioCheckboxes($$anchor, $$props) {
	$.push($$props, true);

	const { SVR, core } = getData();
	var div = root();
	var node = $.child(div);

	RadioButtonGroup(node, {
		get options() {
			return SVR;
		},
		value: 2
	});

	var node_1 = $.sibling(node, 2);

	Text(node_1, { type: "number", value: 1 });

	var node_2 = $.sibling(node_1, 2);

	Select(node_2, {
		value: "",
		get options() {
			return SVR;
		},
		label: "name",
		placeholder: "Options"
	});

	var div_1 = $.sibling(node_2, 2);
	var node_3 = $.child(div_1);

	CheckboxGroup(node_3, {
		get options() {
			return core;
		},
		value: [1, 2, 3, 6, 7, 8]
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}