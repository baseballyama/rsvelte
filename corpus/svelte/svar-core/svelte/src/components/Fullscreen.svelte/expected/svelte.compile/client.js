import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { hotkeys } from "@svar-ui/lib-dom";
import Button from "./Button.svelte";

var root = $.from_html(`<i></i>`);
var root_1 = $.from_html(`<div class="wx-fullscreen svelte-1oh95pl" tabindex="-1"><!> <!></div>`);

export default function Fullscreen($$anchor, $$props) {
	$.push($$props, true);

	const $hotkeys = () => $.store_get(hotkeys, '$hotkeys', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let hotkey = $.prop($$props, 'hotkey', 3, null);

	$.user_effect(() => {
		if (hotkey()) $hotkeys().configure({ [hotkey()]: toggleFullscreen }, node);
	});

	let node = null;
	let inFullscreen = $.state(false);
	let icon = $.derived(() => `wxi-${$.get(inFullscreen) ? "collapse" : "expand"}`);

	function toggleFullscreen() {
		if (!$.get(inFullscreen) && node) {
			node.requestFullscreen();
		} else if ($.get(inFullscreen)) {
			document.exitFullscreen();
		}

		$.set(inFullscreen, !$.get(inFullscreen));
	}

	const setFullscreenState = () => {
		$.set(inFullscreen, document.fullscreenElement === node);
	};

	$.user_effect(() => {
		document.addEventListener("fullscreenchange", setFullscreenState);

		return () => {
			document.removeEventListener("fullscreenchange", setFullscreenState);
		};
	});

	var div = root_1();
	var node_1 = $.child(div);

	$.snippet(node_1, () => $$props.children ?? $.noop);

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_3 = $.first_child(fragment);

			$.snippet(node_3, () => $$props.toggleButton, () => toggleFullscreen, () => $.get(inFullscreen));
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			Button($$anchor, {
				css: 'wx-fullscreen-button',
				onclick: toggleFullscreen,
				children: ($$anchor, $$slotProps) => {
					var i = root();

					$.template_effect(() => $.set_class(i, 1, `${$.get(icon)} wx-fullscreen-icon`, 'svelte-1oh95pl'));
					$.append($$anchor, i);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_2, ($$render) => {
			if ($$props.toggleButton) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => node = $$value, () => node);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}