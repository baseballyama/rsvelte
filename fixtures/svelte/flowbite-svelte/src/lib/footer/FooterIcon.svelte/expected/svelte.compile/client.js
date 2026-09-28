import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { footerIcon } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'href',
	'ariaLabel',
	'class'
]);

var root = $.from_html(`<a><!></a>`);

export default function FooterIcon($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("footerIcon"));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var a = root();

			$.attribute_effect(
				a,
				($0) => ({
					...restProps,
					href: $$props.href,
					'aria-label': $$props.ariaLabel,
					class: $0
				}),
				[
					() => footerIcon({ class: clsx($.get(theme), $$props.class) })
				]
			);

			var node_1 = $.child(a);

			$.snippet(node_1, () => $$props.children);
			$.reset(a);
			$.append($$anchor, a);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.snippet(node_2, () => $$props.children);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.href) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}