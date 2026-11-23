import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { createEventDispatcher } from "svelte";
export default function String($$anchor, $$props) {
	$.push($$props, true);
	const d = createEventDispatcher();
	$.pop();
}
