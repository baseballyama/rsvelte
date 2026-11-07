import * as $ from 'svelte/internal/server';
import Foo from './Foo.svelte';

export default function Main($$renderer) {
	Foo($$renderer, { x: true });
}