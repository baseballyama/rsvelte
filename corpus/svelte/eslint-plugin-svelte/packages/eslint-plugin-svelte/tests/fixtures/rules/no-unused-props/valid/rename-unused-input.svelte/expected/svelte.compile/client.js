import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Rename_unused_input($$anchor, $$props) {
	// userRole is unused but it should be reported by @typescript-eslint/no-unused-vars rule.
	console.log($$props.name, $$props.age);
}