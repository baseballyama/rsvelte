import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { clickOutside } from "@svar-ui/lib-dom";
import { fly } from "svelte/transition";

var root = $.from_html(`<div><!></div>`);

export default function SideArea($$anchor, $$props) {
	$.push($$props, true);

	let position = $.prop($$props, 'position', 3, "right"),
		css = $.prop($$props, 'css', 3, "");

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.action(div, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => () => $$props.oncancel && $$props.oncancel());
	$.template_effect(() => $.set_class(div, 1, `wx-sidearea wx-pos-${position() ?? ''} ${css() ?? ''}`, 'svelte-4hvxcm'));
	$.transition(3, div, () => fly, () => ({ x: 650, opacity: 1 }));
	$.append($$anchor, div);
	$.pop();
}