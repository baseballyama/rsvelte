import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { lockscroll } from '@svelte-put/lockscroll';

var root = $.from_html(`<div class="flex justify-center gap-4"><button class="c-btn">Toggle lock scroll</button> <button class="c-btn c-btn--outlined">Force locked</button> <button class="c-btn c-btn--outlined">Force unlocked</button></div>`);

export default function Svelte_rune($$anchor, $$props) {
	$.push($$props, true);

	class ScrollLock {
		#locked = $.state(false);

		get locked() {
			return $.get(this.#locked);
		}

		set locked(value) {
			$.set(this.#locked, value, true);
		}

		toggle(force = !this.locked) {
			this.locked = force;
		}
	}

	const lock = new ScrollLock();
	var div = root();

	$.action($.document.body, ($$node, $$action_arg) => lockscroll?.($$node, $$action_arg), () => lock.locked);

	var button = $.child(div);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.reset(div);
	$.delegated('click', button, () => lock.toggle());
	$.delegated('click', button_1, () => lock.toggle(true));
	$.delegated('click', button_2, () => lock.toggle(false));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);