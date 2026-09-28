import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { ColorBoard, Dropdown } from "@svar-ui/svelte-core";
import { clickOutside } from "@svar-ui/lib-dom";

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div class="value svelte-k0tcm9" tabindex="0"> </div> <!>`, 1);

export default function ColorEditor($$anchor, $$props) {
	$.push($$props, true);

	let value = $.proxy($$props.editor.value);

	function updateValue({ value, input }) {
		if (input) $$props.onapply(value); else $$props.onsave();
	}

	let node;

	onMount(() => {
		node.focus();

		if (window.getSelection) {
			window.getSelection().removeAllRanges();
		}
	});

	var fragment = root_1();
	var div = $.first_child(fragment);
	var text = $.only_child(div, true);

	$.bind_this(div, ($$value) => node = $$value, () => node);

	var node_1 = $.sibling(div, 2);

	Dropdown(node_1, {
		width: "auto",
		trackScroll: true,
		get oncancel() {
			return $$props.oncancel;
		},

		children: ($$anchor, $$slotProps) => {
			var div_1 = root();
			var node_2 = $.child(div_1);

			ColorBoard(node_2, {
				get value() {
					return value;
				},
				onchange: updateValue,
				button: true
			});

			$.reset(div_1);
			$.action(div_1, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => () => $$props.onsave(true));
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	$.template_effect(() => $.set_text(text, value));

	$.delegated('click', div, function (...$$args) {
		$$props.oncancel?.apply(this, $$args);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);