import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import Component from "./component.svelte";
export default function Instance($$anchor) {
	let bound = $.state(void 0);
	$.get(bound)?.open("y");
	$.bind_this(Component($$anchor, { value: "x" }), ($$value) => $.set(bound, $$value, true), () => $.get(bound));
}
