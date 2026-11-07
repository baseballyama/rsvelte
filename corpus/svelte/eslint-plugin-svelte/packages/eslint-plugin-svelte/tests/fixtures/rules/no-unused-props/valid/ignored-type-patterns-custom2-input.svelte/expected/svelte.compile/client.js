import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Ignored_type_patterns_custom2_input($$anchor, $$props) {
	$.push($$props, true);
	console.log($$props.value, $$props.config.secretKey);
	$.pop();
}