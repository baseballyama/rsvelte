import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { createEventDispatcher } from "svelte";
export default function Num($$anchor, $$props) {
	$.push($$props, true);
	const GO = 1;
	const d = createEventDispatcher();
	$.pop();
}
