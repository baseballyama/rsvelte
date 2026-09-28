import * as $ from 'svelte/internal/server';
import { focus } from '$clib/actions/use-focus/use-focus';

export default function Use_focus($$renderer) {
	$$renderer.push(`<input id="focus"/>`);
}