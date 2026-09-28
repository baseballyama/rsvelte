import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { clickOutside } from "$lib/utils/event.js";
import { fade } from "svelte/transition";
import { createRootState } from "./root.svelte.js";
import { setContext } from "svelte";

var root = $.from_html(`<div class="fixed top-0 left-0 z-1000 h-full w-full bg-black opacity-[0.4] lg:hidden"></div>`);
var root_1 = $.from_html(`<!> <div><div><!></div></div>`, 1);

export default function Root($$anchor, $$props) {
	$.push($$props, true);

	let klass = $.prop($$props, 'class', 3, ""),
		alignment = $.prop($$props, 'alignment', 3, "left"),
		children = $.prop($$props, 'children', 3, undefined);

	const rootState = createRootState({
		isMobile: false,
		isActive: false,
		alignment: alignment(),
		contentPosition: "top-[112%]",
		transY: -10
	});

	setContext("split-button", rootState);

	$.user_effect(() => {
		if (window.innerWidth < 767) {
			rootState.setIsMobile(true);
		} else {
			rootState.setIsMobile(false);
		}

		// update when the user is resizing the window
		window.addEventListener("resize", () => {
			if (window.innerWidth < 767) {
				rootState.setIsMobile(true);
			} else {
				rootState.setIsMobile(false);
			}
		});
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.transition(1, div, () => fade);
			$.transition(2, div, () => fade);
			$.append($$anchor, div);
		};

		var d = $.derived(() => rootState.getIsActive());

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);
	var div_2 = $.child(div_1);
	var node_1 = $.child(div_2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.snippet(node_2, children);
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (children()) $$render(consequent_1);
		});
	}

	$.reset(div_2);
	$.action(div_2, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => () => rootState.setIsActive(false));
	$.reset(div_1);
	$.template_effect(() => $.set_class(div_2, 1, `relative inline-block ${klass() ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}