import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="w-full h-[320px] overflow-y-auto relative"><header class="sticky top-0 z-10 bg-primary-500/80 backdrop-blur-sm p-4">(header)</header> <main class="preset-filled-secondary-500 p-4 space-y-4"><p class="preset-filled-warning-500 p-4">Paragraph 1</p> <p class="preset-filled-warning-500 p-4">Paragraph 2</p> <p class="preset-filled-warning-500 p-4">Paragraph 3</p> <p class="preset-filled-warning-500 p-4">Paragraph 4</p> <p class="preset-filled-warning-500 p-4">Paragraph 5</p></main> <footer class="preset-filled-tertiary-500 p-4">(footer)</footer></div>`);

export default function Sticky_header($$anchor) {
	var div = root();

	$.append($$anchor, div);
}