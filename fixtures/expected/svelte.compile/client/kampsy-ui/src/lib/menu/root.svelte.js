import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { clickOutside } from "$lib/utils/event.js";
import { fade } from "svelte/transition";
import { createRootState } from "./root.svelte.js";
import { setContext } from "svelte";

var root = $.from_html(`<div class="bg-kui-black fixed top-0 left-0 z-1000 h-full w-full opacity-40 lg:hidden"></div>`);
var root_1 = $.from_html(`<!> <div><!></div>`, 1);

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

	setContext("menu", rootState);

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

		// when the esc key is pressed
		window.addEventListener("keydown", (event) => {
			if (event.code == "Escape") {
				rootState.setIsActive(false);
				event.stopPropagation();
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
	var node_1 = $.child(div_1);

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

	$.reset(div_1);
	$.action(div_1, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => () => rootState.setIsActive(false));
	$.template_effect(() => $.set_class(div_1, 1, `relative inline-block ${klass() ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}