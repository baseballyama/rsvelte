import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Anchor from './Anchor.svelte';

export default function Main($$anchor) {
	Anchor($$anchor, {});
}