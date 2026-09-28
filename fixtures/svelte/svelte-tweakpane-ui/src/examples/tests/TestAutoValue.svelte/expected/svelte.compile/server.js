import * as $ from 'svelte/internal/server';
import { AutoValue } from '$lib';

export default function TestAutoValue($$renderer) {
	let number = 0;
	let color = '#ff00ff';
	let colorArray = { r: 0, g: 0, b: 255 };
	let point = { x: 0, y: 0 };
	let text = 'Cosmic manifold';
	let number1InternalEventCount = 0;
	let number1ExternalEventCount = 0;
	let number2InternalEventCount = 0;
	let number2ExternalEventCount = 0;
	let color1InternalEventCount = 0;
	let color1ExternalEventCount = 0;
	let color2InternalEventCount = 0;
	let color2ExternalEventCount = 0;
	let point1InternalEventCount = 0;
	let point1ExternalEventCount = 0;
	let point2InternalEventCount = 0;
	let point2ExternalEventCount = 0;
	let text1InternalEventCount = 0;
	let text1ExternalEventCount = 0;
	let text2InternalEventCount = 0;
	let text2ExternalEventCount = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		AutoValue($$renderer, {
			label: 'Number 1',
			get value() {
				return number;
			},

			set value($$value) {
				number = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		AutoValue($$renderer, {
			label: 'Number 2',
			get value() {
				return number;
			},

			set value($$value) {
				number = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		AutoValue($$renderer, {
			label: 'Color 1',
			get value() {
				return color;
			},

			set value($$value) {
				color = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		AutoValue($$renderer, {
			label: 'Color 2',
			get value() {
				return color;
			},

			set value($$value) {
				color = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		AutoValue($$renderer, {
			label: 'Point 1',
			get value() {
				return point;
			},

			set value($$value) {
				point = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		AutoValue($$renderer, {
			label: 'Point 2',
			get value() {
				return point;
			},

			set value($$value) {
				point = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		AutoValue($$renderer, {
			label: 'Text 1',
			get value() {
				return text;
			},

			set value($$value) {
				text = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		AutoValue($$renderer, {
			label: 'Text 2',
			get value() {
				return text;
			},

			set value($$value) {
				text = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <hr/> `);

		AutoValue($$renderer, {
			label: 'Color Array',
			get value() {
				return colorArray;
			},

			set value($$value) {
				colorArray = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre>Number Value: <span>${$.escape(number)}</span></pre> <pre>Number 1 Internal: <span>${$.escape(number1InternalEventCount)}</span></pre> <pre>Number 1 External: <span>${$.escape(number1ExternalEventCount)}</span></pre> <pre>Number 2 Internal: <span>${$.escape(number2InternalEventCount)}</span></pre> <pre>Number 2 External: <span>${$.escape(number2ExternalEventCount)}</span></pre> <pre>Color Value: <span>${$.escape(color)}</span></pre> <pre>Color 1 Internal: <span>${$.escape(color1InternalEventCount)}</span></pre> <pre>Color 1 External: <span>${$.escape(color1ExternalEventCount)}</span></pre> <pre>Color 2 Internal: <span>${$.escape(color2InternalEventCount)}</span></pre> <pre>Color 2 External: <span>${$.escape(color2ExternalEventCount)}</span></pre> <pre>Point Value: <span>${$.escape(point)}</span></pre> <pre>Point 1 Internal: <span>${$.escape(point1InternalEventCount)}</span></pre> <pre>Point 1 External: <span>${$.escape(point1ExternalEventCount)}</span></pre> <pre>Point 2 Internal: <span>${$.escape(point2InternalEventCount)}</span></pre> <pre>Point 2 External: <span>${$.escape(point2ExternalEventCount)}</span></pre> <pre>Text Value: <span>${$.escape(text)}</span></pre> <pre>Text 1 Internal: <span>${$.escape(text1InternalEventCount)}</span></pre> <pre>Text 1 External: <span>${$.escape(text1ExternalEventCount)}</span></pre> <pre>Text 2 Internal: <span>${$.escape(text2InternalEventCount)}</span></pre> <pre>Text 2 External: <span>${$.escape(text2ExternalEventCount)}</span></pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}