import * as $ from 'svelte/internal/server';
import { a } from './a.svelte';
import B from './b.svelte';
import { b } from './b.svelte.js';
import { c } from './c.svelte';
import D from './d.svelte';
import { d } from './d.svelte.js';

export default function Input($$renderer) {
	a;
	b;
	c;
	d;
	B($$renderer, {});
	$$renderer.push(`<!----> `);
	D($$renderer, {});
	$$renderer.push(`<!---->`);
}