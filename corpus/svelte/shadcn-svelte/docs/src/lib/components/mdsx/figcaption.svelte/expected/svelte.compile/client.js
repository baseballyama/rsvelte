import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";
import { getIconForLanguageExtension } from "../icons/icons.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'children',
	'data-language'
]);

var root = $.from_html(`<figcaption><!> <!></figcaption>`);

export default function Figcaption($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	const Icon = $.derived(() => $$props['data-language'] && typeof $$props['data-language'] === "string"
		? getIconForLanguageExtension($$props['data-language'])
		: null);

	var figcaption = root();

	$.attribute_effect(figcaption, ($0) => ({ class: $0, ...restProps }), [
		() => cn("flex items-center gap-2 text-code-foreground [&_svg]:size-4 [&_svg]:text-code-foreground [&_svg]:opacity-70", $$props.class)
	]);

	var node = $.child(figcaption);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => $.get(Icon), ($$anchor, Icon_1) => {
				Icon_1($$anchor, {});
			});

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($.get(Icon)) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	$.snippet(node_2, () => $$props.children ?? $.noop);
	$.reset(figcaption);
	$.append($$anchor, figcaption);
	$.pop();
}