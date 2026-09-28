import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { useNumberFieldInput } from './number-field.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);
var root = $.from_html(`<input/>`);

export default function Number_field_input($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		rest = $.rest_props($$props, rest_excludes);

	const inputState = useNumberFieldInput();
	var input = root();

	$.attribute_effect(
		input,
		($0) => ({
			class: $0,
			'data-slot': 'number-field-input',
			...inputState.props,
			...rest
		}),
		[
			() => cn('aria-invalid:border-destructive border-border h-9 flex-1 rounded-md border px-4 text-center outline-none', $$props.class)
		],
		void 0,
		void 0,
		'svelte-1xawprr',
		true
	);

	$.bind_this(input, ($$value) => ref($$value), () => ref());
	$.bind_value(input, () => inputState.rootState.opts.value.current, ($$value) => inputState.rootState.opts.value.current = $$value);
	$.append($$anchor, input);
	$.pop();
}