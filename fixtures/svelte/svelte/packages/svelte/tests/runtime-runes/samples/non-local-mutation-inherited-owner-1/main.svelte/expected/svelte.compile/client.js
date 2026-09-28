import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import Sub from './sub.svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let list = $.proxy([]);

	setContext('list', list);
	Sub($$anchor, {});
	$.pop();
}