import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { toast } from './toast';

var root = $.from_html(`<div class="not-prose flex flex-wrap items-center gap-2"><button class="c-btn c-btn--outlined">info</button> <button class="c-btn c-btn--outlined">success</button> <button class="c-btn c-btn--outlined">warning</button> <button class="c-btn c-btn--outlined">error</button></div>`);

export default function Usage($$anchor, $$props) {
	$.push($$props, true);

	const message = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s`;
	var div = root();
	var button = $.child(div);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);

	$.reset(div);
	$.delegated('click', button, () => toast.info(message));
	$.delegated('click', button_1, () => toast.success(message));
	$.delegated('click', button_2, () => toast.warning(message));
	$.delegated('click', button_3, () => toast.error(message));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);