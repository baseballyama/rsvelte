import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { fade } from "svelte/transition";
export default function Global_element_directives($$anchor) {
	let c = "red";
	let x = 1;
	$.transition(3, $.window, () => fade);
}
