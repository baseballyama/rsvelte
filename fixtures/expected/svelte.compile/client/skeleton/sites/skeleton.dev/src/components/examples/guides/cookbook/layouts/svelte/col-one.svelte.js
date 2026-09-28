import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="w-full grid grid-rows-[auto_1fr_auto]"><header class="preset-filled-primary-500 p-4">(header)</header> <main class="preset-filled-secondary-500 p-4 space-y-4"><p class="preset-filled-warning-500 p-4">Paragraph 1</p> <p class="preset-filled-warning-500 p-4">Paragraph 2</p> <p class="preset-filled-warning-500 p-4">Paragraph 3</p></main> <footer class="preset-filled-tertiary-500 p-4">(footer)</footer></div>`);

export default function Col_one($$anchor) {
	var div = root();

	$.append($$anchor, div);
}