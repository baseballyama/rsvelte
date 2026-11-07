import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';
import { BROWSER } from 'esm-env';

export default function Env_guards01_input($$renderer) {
	console.log(browser && location.href);
	console.log(BROWSER && location.href);
}