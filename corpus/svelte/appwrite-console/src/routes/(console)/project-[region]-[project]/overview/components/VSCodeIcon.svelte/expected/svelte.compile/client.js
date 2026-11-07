import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { app } from '$lib/stores/app';
import Light from '../assets/vscode.svg';
import Dark from '../assets/dark/vscode.svg';

var root = $.from_html(`<img width="16" height="16" alt=""/>`);

export default function VSCodeIcon($$anchor, $$props) {
	$.push($$props, true);

	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var img = root();

	$.template_effect(() => $.set_attribute(img, 'src', $app().themeInUse === 'dark' ? Dark : Light));
	$.append($$anchor, img);
	$.pop();
	$$cleanup();
}