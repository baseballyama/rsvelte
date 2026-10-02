import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { foo } from './Child.svelte';

export default function Main($$anchor) {
	foo($$anchor, () => 1, () => 2);
}