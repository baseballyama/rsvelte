import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { tableBodyCell } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'colspan',
	'onclick'
]);

var root = $.from_html(`<button><!></button>`);
var root_1 = $.from_html(`<td><!></td>`);

export default function TableBodyCell($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("tableBodyCell"));
	var td = root_1();

	$.attribute_effect(td, ($0) => ({ ...restProps, class: $0, colspan: $$props.colspan ?? 1 }), [
		() => tableBodyCell({ class: clsx($.get(theme), $$props.class) })
	]);

	var node = $.child(td);

	{
		var consequent_1 = ($$anchor) => {
			var button = root();
			var node_1 = $.child(button);

			{
				var consequent = ($$anchor) => {
					var fragment = $.comment();
					var node_2 = $.first_child(fragment);

					$.snippet(node_2, () => $$props.children);
					$.append($$anchor, fragment);
				};

				$.if(node_1, ($$render) => {
					if ($$props.children) $$render(consequent);
				});
			}

			$.reset(button);

			$.delegated('click', button, function (...$$args) {
				$$props.onclick?.apply(this, $$args);
			});

			$.append($$anchor, button);
		};

		var consequent_2 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_3 = $.first_child(fragment_1);

			$.snippet(node_3, () => $$props.children);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.onclick) $$render(consequent_1); else if ($$props.children) $$render(consequent_2, 1);
		});
	}

	$.reset(td);
	$.append($$anchor, td);
	$.pop();
}

$.delegate(['click']);