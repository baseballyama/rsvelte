import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Nested_unused2_input($$anchor, $$props) {
	$.push($$props, true);

	// Won't be reported as unused
	console.log($$props.user.name);

	$.pop();
}