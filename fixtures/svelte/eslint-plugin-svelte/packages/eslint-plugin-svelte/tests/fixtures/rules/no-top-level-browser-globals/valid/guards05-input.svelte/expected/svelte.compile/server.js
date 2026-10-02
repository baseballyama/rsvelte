import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';

export default function Guards05_input($$renderer) {
	console.log(browser ? location.href : null);
	console.log(!browser ? null : location.href);
}