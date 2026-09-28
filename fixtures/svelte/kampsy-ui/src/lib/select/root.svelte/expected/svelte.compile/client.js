import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { clickOutside } from "$lib/utils/event.js";
import { setContext } from "svelte";
import { fade } from "svelte/transition";
import { createRootState } from "./root.svelte.js";

var root = $.from_html(`<div class="bg-kui-black fixed top-0 left-0 z-1000 h-full w-full opacity-[0.4] lg:hidden"></div>`);
var root_1 = $.from_html(`<!> <div><div><!></div></div>`, 1);

export default function Root($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, ""),
		error = $.prop($$props, 'error', 11, ""),
		loading = $.prop($$props, 'loading', 11, false),
		size = $.prop($$props, 'size', 3, "medium"),
		klass = $.prop($$props, 'class', 3, "");

	const rootState = createRootState({
		isMobile: false,
		error: error(),
		loading: loading(),
		selected: "",
		isActive: false,
		size: size(),
		contentPosition: "top-[112%]",
		transY: -10
	});

	setContext("select", rootState);

	// Assign the selected value to the parent component value prop when changed.
	$.user_effect(() => {
		value(rootState.getSelected());
	});

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

		// When error is changed
		rootState.setError(error());

		// When loading is changed
		rootState.setLoading(loading());
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

	$.snippet(node_1, () => $$props.children);
	$.reset(div_2);
	$.action(div_2, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => () => rootState.setIsActive(false));
	$.reset(div_1);
	$.template_effect(() => $.set_class(div_2, 1, `relative inline-block ${klass() ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}