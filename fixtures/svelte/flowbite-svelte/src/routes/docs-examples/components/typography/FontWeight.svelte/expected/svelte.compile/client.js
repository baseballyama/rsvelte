import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="font-thin dark:text-white">FlowBite</p> <p class="font-extralight dark:text-white">FlowBite</p> <p class="font-light dark:text-white">FlowBite</p> <p class="font-normal dark:text-white">FlowBite</p> <p class="font-medium dark:text-white">FlowBite</p> <p class="font-semibold dark:text-white">FlowBite</p> <p class="font-bold dark:text-white">FlowBite</p> <p class="font-extrabold dark:text-white">FlowBite</p> <p class="font-black dark:text-white">FlowBite</p>`, 1);

export default function FontWeight($$anchor) {
	var fragment = root();

	$.next(16);
	$.append($$anchor, fragment);
}