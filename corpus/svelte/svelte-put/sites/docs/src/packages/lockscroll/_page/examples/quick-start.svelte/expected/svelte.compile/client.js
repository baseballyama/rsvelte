import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { lockscroll } from '@svelte-put/lockscroll';

var root = $.from_html(`<button class="c-btn mx-auto">Toggle lock scroll on body</button>`);

export default function Quick_start($$anchor) {
	let locked = $.state(false);

	function toggleLockScroll() {
		$.set(locked, !$.get(locked));
	}

	var button = root();

	$.action($.document.body, ($$node, $$action_arg) => lockscroll?.($$node, $$action_arg), () => $.get(locked));
	$.delegated('click', button, toggleLockScroll);
	$.append($$anchor, button);
}

$.delegate(['click']);