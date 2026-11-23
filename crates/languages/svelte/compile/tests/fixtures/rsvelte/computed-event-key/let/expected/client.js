import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { createEventDispatcher } from "svelte";
export default function Let($$anchor, $$props) {
	$.push($$props, true);
	let GO = "go";
	const d = createEventDispatcher();
	$.pop();
}
