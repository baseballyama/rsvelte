import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

export default function Main($$anchor) {
	Nested($$anchor, {});
}