import * as $ from 'svelte/internal/server';
import { items } from './data.js';

export default function Child($$renderer, $$props) {
	const myArr = items;

	$$renderer.push(`<p>child</p>`);
	$.bind_props($$props, { myArr });
}