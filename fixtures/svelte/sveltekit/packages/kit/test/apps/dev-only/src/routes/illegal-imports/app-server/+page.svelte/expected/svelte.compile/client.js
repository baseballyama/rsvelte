import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { read } from '$app/server';

export default function _page($$anchor) {
	read;
}