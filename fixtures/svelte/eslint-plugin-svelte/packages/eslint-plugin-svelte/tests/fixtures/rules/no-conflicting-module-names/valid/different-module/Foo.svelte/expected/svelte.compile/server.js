import * as $ from 'svelte/internal/server';
import { count } from "./foo-state.svelte";

export default function Foo($$renderer) {
	$$renderer.push(`<p>${$.escape(count)}</p>`);
}