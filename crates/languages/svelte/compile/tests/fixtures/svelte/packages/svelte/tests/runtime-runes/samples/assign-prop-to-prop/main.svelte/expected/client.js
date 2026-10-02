import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Test from './Test.svelte';

export default function Main($$anchor) {
	Test($$anchor, { a: 5 });
}