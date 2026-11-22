import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { createEventDispatcher } from "svelte";
export default function Readonly($$anchor, $$props) {
	$.push($$props, true);
	const GO = "go";
	const d = createEventDispatcher();
	$.pop();
}
