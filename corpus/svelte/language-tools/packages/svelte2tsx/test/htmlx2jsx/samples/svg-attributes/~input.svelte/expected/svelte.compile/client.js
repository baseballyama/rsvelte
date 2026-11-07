import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg width="12" height="12" viewBox="0 0 24 24"></svg>`);

export default function Input($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}