import * as $ from 'svelte/internal/server';
import Header from './Header.svelte';
import Footer from './Footer.svelte';

export default function Child($$renderer) {
	Header($$renderer, {});
	$$renderer.push(`<!----> `);
	Footer($$renderer, {});
	$$renderer.push(`<!---->`);
}