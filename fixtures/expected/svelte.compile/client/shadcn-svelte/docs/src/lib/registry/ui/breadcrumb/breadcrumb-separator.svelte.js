import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<li><!></li>`);

export default function Breadcrumb_separator($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var li = root();

	$.attribute_effect(
		li,
		($0) => ({
			'data-slot': 'breadcrumb-separator',
			role: 'presentation',
			'aria-hidden': 'true',
			class: $0,
			...restProps
		}),
		[() => cn("cn-breadcrumb-separator", $$props.class)]
	);

	var node = $.child(li);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			IconPlaceholder($$anchor, {
				lucide: 'ChevronRightIcon',
				tabler: 'IconChevronRight',
				hugeicons: 'ArrowRight01Icon',
				phosphor: 'CaretRightIcon',
				remixicon: 'RiArrowRightSLine'
			});
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(li);
	$.bind_this(li, ($$value) => ref($$value), () => ref());
	$.append($$anchor, li);
	$.pop();
}