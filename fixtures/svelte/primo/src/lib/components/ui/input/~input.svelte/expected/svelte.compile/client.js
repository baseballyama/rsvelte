import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.ts';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'value', 'class']);
var root = $.from_html(`<input/>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		restProps = $.rest_props($$props, rest_excludes);

	var input = root();

	$.attribute_effect(
		input,
		($0) => ({ class: $0, ...restProps }),
		[
			() => cn('border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-hidden focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', $$props.class)
		],
		void 0,
		void 0,
		void 0,
		true
	);

	$.bind_this(input, ($$value) => ref($$value), () => ref());
	$.bind_value(input, value);
	$.append($$anchor, input);
	$.pop();
}