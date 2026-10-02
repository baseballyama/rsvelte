import 'svelte/internal/disclose-version';
import { c } from './c';
import * as $ from 'svelte/internal/client';

const a = true;

export default function Organize_imports_unchanged1($$anchor) {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, c));
	$.append($$anchor, text);
}