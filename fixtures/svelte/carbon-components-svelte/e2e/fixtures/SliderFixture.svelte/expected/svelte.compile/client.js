import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from "carbon-components-svelte";

var root = $.from_html(`<!> <div data-testid="value-display"> </div>`, 1);

export default function SliderFixture($$anchor) {
	let value = 50;
	var fragment = root();
	var node = $.first_child(fragment);

	Slider(node, {
		'data-testid': 'slider',
		labelText: 'Slider',
		min: 0,
		max: 100,
		step: 1,
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	var div = $.sibling(node, 2);
	var text = $.only_child(div, true);

	$.template_effect(() => $.set_text(text, value));
	$.append($$anchor, fragment);
}