import * as $ from 'svelte/internal/server';
import { NumberInput } from "carbon-components-svelte";

export default function NumberInputFixture($$renderer) {
	let value = 10;
	let valueLocale = 1234.5;
	let valueNoWheel = 5;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		NumberInput($$renderer, {
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
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <div data-testid="number-input-formatting">`);

		NumberInput($$renderer, {
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
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <span data-testid="number-input-locale-value" aria-live="polite">${$.escape(valueLocale)}</span></div> `);

		NumberInput($$renderer, {
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
				$$settled = false;
			}
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}