import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";
import RandomButton from "./random-button.svelte";
import ResetButton from "./reset-button.svelte";

var root = $.from_html(`<div><!> <!></div>`);

export default function Customizer_controls($$anchor, $$props) {
	$.push($$props, true);

	let submenu = $.prop($$props, 'submenu', 3, false);
	var div = root();
	var node = $.child(div);

	RandomButton(node, {
		get submenu() {
			return submenu();
		}
	});

	var node_1 = $.sibling(node, 2);

	ResetButton(node_1, {
		get submenu() {
			return submenu();
		}
	});

	$.reset(div);
	$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(cn("items-center gap-0", $$props.class))]);
	$.append($$anchor, div);
	$.pop();
}