import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Custom_config_combination_input($$anchor, $$props) {
	$.push($$props, true);
	console.log($$props.my_foo.foo);
	$.pop();
}