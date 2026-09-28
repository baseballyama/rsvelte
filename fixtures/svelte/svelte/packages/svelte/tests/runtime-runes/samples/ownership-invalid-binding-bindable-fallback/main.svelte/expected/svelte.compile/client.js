import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Parent from './Parent.svelte';

export default function Main($$anchor) {
	Parent($$anchor, {});
}