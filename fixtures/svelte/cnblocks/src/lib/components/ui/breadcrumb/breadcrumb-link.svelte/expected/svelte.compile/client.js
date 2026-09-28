import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'href',
	'child',
	'children'
]);

var root = $.from_html(`<a><!></a>`);

export default function Breadcrumb_link($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		href = $.prop($$props, 'href', 3, undefined),
		restProps = $.rest_props($$props, rest_excludes);

	const attrs = $.derived(() => ({
		class: cn("transition-colors hover:text-foreground", $$props.class),
		href: href(),
		...restProps
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.child, () => ({ props: $.get(attrs) }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var a = root();

			$.attribute_effect(a, () => ({ ...$.get(attrs) }));

			var node_2 = $.child(a);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(a);
			$.bind_this(a, ($$value) => ref($$value), () => ref());
			$.append($$anchor, a);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}