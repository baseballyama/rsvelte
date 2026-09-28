import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { app } from '$lib/stores/app';
import Light from '../assets/cursor-ai.svg';
import Dark from '../assets/dark/cursor-ai.svg';

var root = $.from_html(`<img width="20" height="20" alt="Cursor"/>`);

export default function CursorIconLarge($$anchor, $$props) {
	$.push($$props, true);

	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var img = root();

	$.template_effect(() => $.set_attribute(img, 'src', $app().themeInUse === 'dark' ? Dark : Light));
	$.append($$anchor, img);
	$.pop();
	$$cleanup();
}