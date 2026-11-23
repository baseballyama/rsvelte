import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { createEventDispatcher } from "svelte";
const GO = "go";
export default function Module($$anchor, $$props) {
	$.push($$props, true);
	const d = createEventDispatcher();
	$.pop();
}
