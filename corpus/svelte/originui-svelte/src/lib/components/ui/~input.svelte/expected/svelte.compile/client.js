import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'ref',
	'type',
	'value'
]);

var root = $.from_html(`<input/>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		type = $.prop($$props, 'type', 3, 'text'),
		value = $.prop($$props, 'value', 15),
		restProps = $.rest_props($$props, rest_excludes);

	var input = root();

	$.attribute_effect(
		input,
		($0) => ({ 'data-slot': 'input', class: $0, type: type(), ...restProps }),
		[
			() => cn('border-input file:text-foreground placeholder:text-muted-foreground/70 flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50', 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', type() === 'search' && '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none', type() === 'file' && 'text-muted-foreground/70 file:border-input file:text-foreground p-0 pr-3 italic file:me-3 file:h-full file:border-0 file:border-r file:border-solid file:bg-transparent file:px-3 file:text-sm file:font-medium file:not-italic', $$props.class)
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