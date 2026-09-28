import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';
import { destroyed } from './destroyed.js';

export default function C($$anchor, $$props) {
	$.push($$props, true);
	onDestroy(() => destroyed.push('C'));
	$.pop();
}