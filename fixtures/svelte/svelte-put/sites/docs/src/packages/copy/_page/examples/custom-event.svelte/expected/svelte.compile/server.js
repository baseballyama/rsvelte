import * as $ from 'svelte/internal/server';
import { copy } from '@svelte-put/copy';

export default function Custom_event($$renderer) {
	$$renderer.push(`<button type="button">...</button> <button type="button">...</button>`);
}