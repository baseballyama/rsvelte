import * as $ from 'svelte/internal/server';
import Button from './Button.svelte';

export default function Main($$renderer) {
	Button($$renderer, {});
	$$renderer.push(`<!----> `);
	Button($$renderer, {});
	$$renderer.push(`<!---->`);
}