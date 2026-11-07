import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Separator } from "$lib/registry/ui/separator/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<span class="cn-field-separator-content relative mx-auto block w-fit bg-background" data-slot="field-separator-content"><!></span>`);
var root_1 = $.from_html(`<div><!> <!></div>`);

export default function Field_separator($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const hasContent = $.derived(() => !!$$props.children);
	var div = root_1();

	$.attribute_effect(
		div,
		($0) => ({
			'data-slot': 'field-separator',
			'data-content': $.get(hasContent),
			class: $0,
			...restProps
		}),
		[() => cn("cn-field-separator relative", $$props.class)]
	);

	var node = $.child(div);

	Separator(node, { class: 'absolute inset-0 top-1/2' });

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var node_2 = $.child(span);

			$.snippet(node_2, () => $$props.children);
			$.reset(span);
			$.append($$anchor, span);
		};

		$.if(node_1, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}