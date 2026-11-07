import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

var root = $.from_html(`<progress class="svelte-1jmmb80"></progress> <button>0%</button> <button>25%</button> <button>50%</button> <button>75%</button> <button>100%</button>`, 1);

export default function Tweened_input($$anchor, $$props) {
	$.push($$props, true);

	const $progress = () => $.store_get(progress, '$progress', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const progress = tweened(0, { duration: 400, easing: cubicOut });
	var fragment = root();
	var progress_1 = $.first_child(fragment);
	var button = $.sibling(progress_1, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var button_4 = $.sibling(button_3, 2);

	$.template_effect(() => $.set_value(progress_1, $progress()));
	$.event('click', button, () => progress.set(0));
	$.event('click', button_1, () => progress.set(0.25));
	$.event('click', button_2, () => progress.set(0.5));
	$.event('click', button_3, () => progress.set(0.75));
	$.event('click', button_4, () => progress.set(1));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}