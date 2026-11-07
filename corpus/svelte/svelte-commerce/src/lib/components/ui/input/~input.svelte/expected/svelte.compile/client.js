import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/core/utils';

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
			() => cn('flex h-9 w-full rounded-radius border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm md:file:text-sm', $$props.class)
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