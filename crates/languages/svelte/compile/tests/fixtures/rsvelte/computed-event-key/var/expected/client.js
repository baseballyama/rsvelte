import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { createEventDispatcher } from "svelte";
export default function Var($$anchor, $$props) {
	$.push($$props, true);
	var GO = 1;
	var GO = "go";
	const d = createEventDispatcher();
	$.pop();
}
