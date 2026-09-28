import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeSlider } from "carbon-components-svelte";

var root = $.from_html(`<!> <div data-testid="value-display"> </div> <div data-testid="value-upper-display"> </div>`, 1);

export default function RangeSliderFixture($$anchor) {
	let value = 20;
	let valueUpper = 80;
	var fragment = root();
	var node = $.first_child(fragment);

	RangeSlider(node, {
		'data-testid': 'range-slider',
		labelText: 'Range',
		min: 0,
		max: 100,
		step: 1,
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		},

		get valueUpper() {
			return valueUpper;
		},

		set valueUpper($$value) {
			valueUpper = $$value;
		}
	});

	var div = $.sibling(node, 2);
	var text = $.only_child(div, true);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1, true);

	$.template_effect(() => {
		$.set_text(text, value);
		$.set_text(text_1, valueUpper);
	});

	$.append($$anchor, fragment);
}