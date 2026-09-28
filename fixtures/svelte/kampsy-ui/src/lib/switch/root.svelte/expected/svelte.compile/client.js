import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { randomString } from "$lib/utils/random.js";
import { setContext } from "svelte";
import { createRootState } from "./root.svelte.js";

var root = $.from_html(`<div><div><!></div></div>`);

export default function Root($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, ""),
		name = $.prop($$props, 'name', 3, undefined),
		size = $.prop($$props, 'size', 3, "medium"),
		fullWidth = $.prop($$props, 'fullWidth', 3, false),
		children = $.prop($$props, 'children', 3, undefined);

	const switchProps = { name: "", size: size(), fullWidth: fullWidth() };

	if (name()) {
		switchProps.name = name();
	} else {
		switchProps.name = randomString(8);
	}

	const rootState = createRootState({ selected: "", ...switchProps });

	setContext("switch", rootState);

	let width = $.derived(() => {
		if (fullWidth()) {
			return "w-full";
		}

		return "";
	});

	// Large size has a different border radius than other sizes
	let borderRadius = $.derived(() => {
		if (size() === "large") {
			return "rounded-[8px]";
		}

		return "rounded-md";
	});

	$.user_effect(() => {
		value(rootState.getSelected());
	});

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (children()) $$render(consequent);
		});
	}

	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, $.clsx($.get(width)));
		$.set_class(div_1, 1, `flex items-center p-1 ${$.get(borderRadius) ?? ''} border-kui-light-gray-200 dark:border-kui-dark-gray-400 border`);
	});

	$.append($$anchor, div);
	$.pop();
}