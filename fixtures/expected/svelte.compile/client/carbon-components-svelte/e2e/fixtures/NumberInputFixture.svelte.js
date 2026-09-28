import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NumberInput } from "carbon-components-svelte";

var root = $.from_html(`<!> <div data-testid="number-input-formatting"><!> <span data-testid="number-input-locale-value" aria-live="polite"> </span></div> <!>`, 1);

export default function NumberInputFixture($$anchor) {
	let value = 10;
	let valueLocale = 1234.5;
	let valueNoWheel = 5;
	var fragment = root();
	var node = $.first_child(fragment);

	NumberInput(node, {
		'data-testid': 'number-input-quantity',
		labelText: 'Quantity',
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
	var node_1 = $.child(div);

	NumberInput(node_1, {
		'data-testid': 'number-input-locale',
		labelText: 'Amount (DE)',
		locale: 'de-DE',
		allowEmpty: true,
		min: 0,
		max: 10000,
		step: 0.1,
		get value() {
			return valueLocale;
		},

		set value($$value) {
			valueLocale = $$value;
		}
	});

	var span = $.sibling(node_1, 2);
	var text = $.only_child(span, true);

	$.reset(div);

	var node_2 = $.sibling(div, 2);

	NumberInput(node_2, {
		'data-testid': 'number-input-no-wheel',
		labelText: 'No wheel',
		disableWheel: true,
		min: 0,
		max: 100,
		get value() {
			return valueNoWheel;
		},

		set value($$value) {
			valueNoWheel = $$value;
		}
	});

	$.template_effect(() => $.set_text(text, valueLocale));
	$.append($$anchor, fragment);
}