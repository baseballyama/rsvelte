import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';

export default function Guards05_input($$anchor) {
	console.log(browser ? null : location.href); // NG
	console.log(!browser ? location.href : null); // NG
}