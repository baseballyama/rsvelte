import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="leading-none dark:text-gray-400">Themesberg was created to bring quality ...</p> <p class="leading-tight dark:text-gray-400">Themesberg was created to bring quality ...</p> <p class="leading-snug dark:text-gray-400">Themesberg was created to bring quality ...</p> <p class="leading-normal dark:text-gray-400">Themesberg was created to bring quality ...</p> <p class="leading-relaxed dark:text-gray-400">Themesberg was created to bring quality ...</p> <p class="leading-loose dark:text-gray-400">Themesberg was created to bring quality ...</p>`, 1);

export default function LineHeight($$anchor) {
	var fragment = root();

	$.next(10);
	$.append($$anchor, fragment);
}