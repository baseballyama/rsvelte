import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { list } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";
import { setListContext } from "$lib/context";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'tag',
	'isContenteditable',
	'position',
	'ctxClass',
	'class'
]);

export default function List($$anchor, $$props) {
	$.push($$props, true);

	let tag = $.prop($$props, 'tag', 3, "ul"),
		isContenteditable = $.prop($$props, 'isContenteditable', 3, false),
		position = $.prop($$props, 'position', 3, "inside"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("list"));
	let contextClass = $.derived(() => $$props.ctxClass || "");

	// Create context object
	const ctx = {
		get ctxClass() {
			return $.get(contextClass);
		}
	};

	// Set context during initialization
	setListContext(ctx);

	$.user_effect(() => {
		$.set(contextClass, $$props.ctxClass || "");
	});

	let classList = $.derived(() => list({
		position: position(),
		tag: tag(),
		class: clsx($.get(theme), $$props.class)
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, tag, false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({
			...restProps,
			class: $.get(classList),
			contenteditable: isContenteditable()
		}));

		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.snippet(node_1, () => $$props.children);
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}