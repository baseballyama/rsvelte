import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

let totalComponents = 0;

export function alertTotal() {
	alert(totalComponents);
}

export default function _1_input($$anchor) {
	totalComponents += 1;
	console.log(`total number of times this component has been created: ${totalComponents}`);
}