import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Slider from "components/Slider";
import Checkbox from "components/Checkbox";
import Code from "docs/Code.svelte";
import sliders from "examples/sliders.txt";

var root = $.from_html(`<div class="my-4"><!></div> <h6>Basic</h6> <small> </small> <!> <h6 class="mt-8">With color prop</h6> <small> </small> <!> <h6 class="mt-8">With steps</h6> <small> </small> <!> <!>`, 1);

export default function Sliders($$anchor) {
	let value = 0;
	let value2 = 0;
	let value3 = 0;
	let disabled = false;
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Checkbox(node, {
		label: 'Disabled',
		get checked() {
			return disabled;
		},

		set checked($$value) {
			disabled = $$value;
		}
	});

	$.reset(div);

	var small = $.sibling(div, 4);
	var text = $.only_child(small);
	var node_1 = $.sibling(small, 2);

	Slider(node_1, {
		min: '0',
		max: '100',
		get disabled() {
			return disabled;
		},

		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	var small_1 = $.sibling(node_1, 4);
	var text_1 = $.only_child(small_1);
	var node_2 = $.sibling(small_1, 2);

	Slider(node_2, {
		color: 'secondary',
		min: '0',
		max: '100',
		get disabled() {
			return disabled;
		},

		get value() {
			return value3;
		},

		set value($$value) {
			value3 = $$value;
		}
	});

	var small_2 = $.sibling(node_2, 4);
	var text_2 = $.only_child(small_2);
	var node_3 = $.sibling(small_2, 2);

	Slider(node_3, {
		min: '0',
		step: '20',
		max: '100',
		get disabled() {
			return disabled;
		},

		get value() {
			return value2;
		},

		set value($$value) {
			value2 = $$value;
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Code(node_4, {
		get code() {
			return sliders;
		}
	});

	$.template_effect(() => {
		$.set_text(text, `Value: ${value ?? ''}`);
		$.set_text(text_1, `Value: ${value3 ?? ''}`);
		$.set_text(text_2, `Value: ${value2 ?? ''}`);
	});

	$.append($$anchor, fragment);
}