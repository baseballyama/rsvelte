import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from "svelte";
import { createModalState } from "./root.svelte.js";
import { preventScroll } from "$lib/utils/general.js";
import { fade } from "svelte/transition";

var root = $.from_html(`<div class="bg-kui-black fixed top-0 left-0 z-1000 h-full w-full opacity-40"></div>`);
var root_1 = $.from_html(`<!> <dialog><div class="fixed top-0 left-0 flex h-full w-full items-center justify-center"><!></div></dialog>`, 1);

export default function Root($$anchor, $$props) {
	$.push($$props, true);

	let active = $.prop($$props, 'active', 15, false),
		sticky = $.prop($$props, 'sticky', 3, false);

	let dialog;
	const rootState = createModalState({ isMobile: false, isActive: active(), sticky: sticky() });

	setContext("modal", rootState);

	$.user_effect(() => {
		active(rootState.getIsActive());
	});

	$.user_effect(() => {
		if (active()) {
			dialog.showModal();
			rootState.setIsActive(true);
			preventScroll(active());
		} else {
			rootState.setIsActive(false);

			const id = setTimeout(
				() => {
					dialog.close();
					clearTimeout(id);
				},
				250
			);

			preventScroll(active());
		}
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
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.transition(1, div, () => fade, () => ({ duration: 100 }));
			$.transition(2, div, () => fade, () => ({ duration: 100 }));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (active()) $$render(consequent);
		});
	}

	var dialog_1 = $.sibling(node, 2);
	var div_1 = $.child(dialog_1);
	var node_1 = $.child(div_1);

	$.snippet(node_1, () => $$props.children);
	$.reset(div_1);
	$.reset(dialog_1);
	$.bind_this(dialog_1, ($$value) => dialog = $$value, () => dialog);
	$.transition(1, div_1, () => fade);
	$.transition(2, div_1, () => fade);
	$.append($$anchor, fragment);
	$.pop();
}