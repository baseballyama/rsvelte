import * as $ from 'svelte/internal/server';
import { foo } from './Child.svelte';

export default function Main($$renderer) {
	foo($$renderer, 1, 2);
}