import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';
import { BROWSER } from 'esm-env';

export default function Env_guards01_input($$anchor) {
	console.log(browser && location.href);
	console.log(BROWSER && location.href);
}