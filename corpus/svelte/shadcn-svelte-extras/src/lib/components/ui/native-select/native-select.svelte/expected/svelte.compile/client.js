import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'value',
	'class',
	'size',
	'children'
]);

var root = $.from_html(`<div data-slot="native-select-wrapper"><select><!></select> <!></div>`);

export default function Native_select($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		size = $.prop($$props, 'size', 3, 'default'),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();
	var select = $.child(div);

	$.attribute_effect(select, () => ({
		'data-slot': 'native-select',
		'data-size': size(),
		class: 'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 h-9 w-full min-w-0 appearance-none rounded-md border bg-transparent py-1 pr-8 pl-2.5 text-sm shadow-xs transition-[color,box-shadow] outline-none select-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:ring-3 data-[size=sm]:h-8',
		...restProps
	}));

	$.customizable_select(select, () => {
		var anchor = $.child(select);
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.snippet(node, () => $$props.children ?? $.noop);
		$.append(anchor, fragment);
	});

	$.bind_this(select, ($$value) => ref($$value), () => ref());

	var node_1 = $.sibling(select, 2);

	ChevronDownIcon(node_1, {
		class: 'text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 select-none',
		'aria-hidden': true,
		'data-slot': 'native-select-icon'
	});

	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_class(div, 1, $0);
			$.set_attribute(div, 'data-size', size());
		},
		[
			() => $.clsx(cn('cn-native-select-wrapper group/native-select relative w-fit has-[select:disabled]:opacity-50', $$props.class))
		]
	);

	$.bind_select_value(select, value);
	$.append($$anchor, div);
	$.pop();
}