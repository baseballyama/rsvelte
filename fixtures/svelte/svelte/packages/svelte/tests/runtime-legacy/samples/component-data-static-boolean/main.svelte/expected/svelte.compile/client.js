import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Foo from './Foo.svelte';

export default function Main($$anchor) {
	Foo($$anchor, { x: true });
}