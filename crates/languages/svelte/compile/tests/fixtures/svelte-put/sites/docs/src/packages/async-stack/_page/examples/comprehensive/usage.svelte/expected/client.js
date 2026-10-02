import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { notiStack } from './notification-stack';

var root = $.from_html(`<button class="c-btn c-btn--outlined">Push an info notification</button> <button class="c-btn">Push a special notification</button>`, 1);

export default function Usage($$anchor, $$props) {
	$.push($$props, true);

	const pushInfo = () => notiStack.push('info', { props: { content: 'An info notification' } });
	const pushSpecial = () => notiStack.push('special');
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);

	$.delegated('click', button, pushInfo);
	$.delegated('click', button_1, pushSpecial);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);