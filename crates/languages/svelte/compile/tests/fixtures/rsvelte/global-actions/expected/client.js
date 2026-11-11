import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { tip, lock } from "./a.js";
export default function Global_actions($$anchor) {
	let locked = $.state(false);
	$.action($.document.body, ($$node, $$action_arg) => lock?.($$node, $$action_arg), () => $.get(locked));
	$.action($.document.body, ($$node) => tip?.($$node));
	$.event("click", $.document.body, () => $.set(locked, !$.get(locked)));
	$.action($.document, ($$node, $$action_arg) => tip?.($$node, $$action_arg), () => "x");
	$.attach($.document, () => (n) => console.log(n));
	$.action($.window, ($$node) => tip?.($$node));
}
