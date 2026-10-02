import 'svelte/internal/disclose-version';
import { c } from './c';
import { d } from './d';
import * as $ from 'svelte/internal/client';

const a = true;

export default function Organize_imports_unchanged2($$anchor) {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${c ?? ''}${d ?? ''}`));
	$.append($$anchor, text);
}