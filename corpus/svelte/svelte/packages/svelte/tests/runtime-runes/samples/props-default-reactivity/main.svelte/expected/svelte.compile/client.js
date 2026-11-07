import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Counter from './Counter.svelte';

export default function Main($$anchor) {
	Counter($$anchor, {});
}