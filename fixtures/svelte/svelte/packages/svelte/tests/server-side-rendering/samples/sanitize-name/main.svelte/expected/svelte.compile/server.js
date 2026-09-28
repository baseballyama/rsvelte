import * as $ from 'svelte/internal/server';
import Foo from './[foo].svelte';

export default function Main($$renderer) {
	Foo($$renderer, {});
}