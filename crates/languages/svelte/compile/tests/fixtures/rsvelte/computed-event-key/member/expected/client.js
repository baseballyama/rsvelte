import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { createEventDispatcher } from "svelte";
export default function Member($$anchor, $$props) {
	$.push($$props, true);
	const K = { go: "go" };
	const d = createEventDispatcher();
	$.pop();
}
