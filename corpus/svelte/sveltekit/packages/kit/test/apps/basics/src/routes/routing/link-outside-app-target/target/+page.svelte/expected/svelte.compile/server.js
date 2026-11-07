import * as $ from 'svelte/internal/server';
import { count } from '../state.js';

export default function _page($$renderer) {
	$$renderer.push(`<h1>target: ${$.escape(count)}</h1>`);
}