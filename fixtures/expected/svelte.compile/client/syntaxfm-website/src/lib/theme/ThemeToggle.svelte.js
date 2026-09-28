import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { theme_maker } from '$state/theme';

var root = $.from_html(`<button class="svelte-1flis1a">🎨</button>`);

export default function ThemeToggle($$anchor, $$props) {
	$.push($$props, true);

	var button = root();

	$.delegated('click', button, function (...$$args) {
		theme_maker.open?.apply(this, $$args);
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);