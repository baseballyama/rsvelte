import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Foo from './[foo].svelte';

export default function Main($$anchor) {
	Foo($$anchor, {});
}