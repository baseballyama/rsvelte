import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let a = 0;
	let b = $.state(0);

	;;
	$.pop();
}