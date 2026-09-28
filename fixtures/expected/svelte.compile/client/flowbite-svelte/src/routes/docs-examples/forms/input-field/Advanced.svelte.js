import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from "flowbite-svelte";

var root = $.from_html(`<input/>`);

export default function Advanced($$anchor) {
	let value = $.state(5);

	{
		const left = ($$anchor) => {
			$.next();

			var text = $.text('#');

			$.append($$anchor, text);
		};

		const children = ($$anchor, props = $.noop) => {
			var input = root();

			$.attribute_effect(input, () => ({ type: 'number', ...props(), class: [props().class, "ps-9"] }), void 0, void 0, void 0, void 0, true);
			$.bind_value(input, () => $.get(value), ($$value) => $.set(value, $$value));
			$.append($$anchor, input);
		};

		Input($$anchor, { left, children, $$slots: { left: true, default: true } });
	}
}