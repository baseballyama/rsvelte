import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import ChevronDown from '@lucide/svelte/icons/chevron-down';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'ref',
	'value'
]);

var root = $.from_html(`<span class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center peer-disabled:opacity-50"><!></span>`);
var root_1 = $.from_html(`<div class="relative"><select><!></select> <!></div>`);

export default function Select_native($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root_1();
	var select = $.child(div);

	$.attribute_effect(select, ($0) => ({ class: $0, ...restProps }), [
		() => cn(
			'peer border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/20 has-[option[disabled]:checked]:text-muted-foreground inline-flex w-full cursor-pointer appearance-none items-center rounded-lg border text-sm shadow-xs shadow-black/5 transition-shadow focus-visible:ring-[3px] focus-visible:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
			$$props.multiple
				? '[&_option:checked]:bg-accent py-1 *:px-3 *:py-1'
				: 'h-9 ps-3 pe-8',
			$$props.class
		)
	]);

	$.customizable_select(select, () => {
		var anchor = $.child(select);
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.snippet(node, () => $$props.children ?? $.noop);
		$.append(anchor, fragment);
	});

	$.bind_this(select, ($$value) => ref($$value), () => ref());

	var node_1 = $.sibling(select, 2);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var node_2 = $.child(span);

			ChevronDown(node_2, { size: 16, 'aria-hidden': 'true' });
			$.reset(span);
			$.append($$anchor, span);
		};

		$.if(node_1, ($$render) => {
			if (!$$props.multiple) $$render(consequent);
		});
	}

	$.reset(div);
	$.bind_select_value(select, value);
	$.append($$anchor, div);
	$.pop();
}