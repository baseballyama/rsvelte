import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div data-testid="wide-description">Short text</div>`);

export default function WideDescription($$anchor) {
	var div = root();

	$.append($$anchor, div);
}