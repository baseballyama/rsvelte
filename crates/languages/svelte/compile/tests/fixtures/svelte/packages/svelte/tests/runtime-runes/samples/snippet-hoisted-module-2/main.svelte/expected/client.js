import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { one } from './Child.svelte';

export default function Main($$anchor) {
	one($$anchor);
}