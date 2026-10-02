import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m4 4 12 12m0-12L4 16" stroke="#CC5449" stroke-width="1.5" stroke-linecap="round"></path></svg>`);

export default function WorkflowFailIcon($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}