import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import Child from './Child.svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);
	setContext("key", 10);
	Child($$anchor, {});
	$.pop();
}