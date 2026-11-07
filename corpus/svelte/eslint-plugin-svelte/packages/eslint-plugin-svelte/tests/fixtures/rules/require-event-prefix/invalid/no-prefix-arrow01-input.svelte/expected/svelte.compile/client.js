import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function No_prefix_arrow01_input($$anchor, $$props) {
	$.push($$props, true);
	$$props.custom();
	$.pop();
}