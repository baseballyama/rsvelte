import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { tableHeadCell } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<th><!></th>`);

export default function TableHeadCell($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("tableHeadCell"));
	var th = root();

	$.attribute_effect(th, ($0) => ({ ...restProps, class: $0 }), [
		() => tableHeadCell({ class: clsx($.get(theme), $$props.class) })
	]);

	var node = $.child(th);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(th);
	$.append($$anchor, th);
	$.pop();
}