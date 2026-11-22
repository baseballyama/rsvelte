import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import Component from "./component.svelte";
export default function Import($$anchor) {
	let component = $.state(void 0);
	const named = $.get(component).api();
	$.bind_this(Component($$anchor, { n: "no" }), ($$value) => $.set(component, $$value, true), () => $.get(component));
}
