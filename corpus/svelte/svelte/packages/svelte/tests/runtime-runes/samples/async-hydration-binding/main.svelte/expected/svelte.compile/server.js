import * as $ from 'svelte/internal/server';
import Async from './Async.svelte';
import Binding from './Binding.svelte';

export default function Main($$renderer) {
	Async($$renderer, {});
	$$renderer.push(`<!----> `);
	Binding($$renderer, {});
	$$renderer.push(`<!---->`);
}