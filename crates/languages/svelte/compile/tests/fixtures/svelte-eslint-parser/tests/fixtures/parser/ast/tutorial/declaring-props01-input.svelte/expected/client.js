import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

export default function Declaring_props01_input($$anchor) {
	Nested($$anchor, { answer: 42 });
}