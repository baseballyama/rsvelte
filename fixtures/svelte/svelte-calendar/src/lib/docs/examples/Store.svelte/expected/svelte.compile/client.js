import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InlineCalendar } from '../../index';
import dayjs from 'dayjs';

var root = $.from_html(`<!> <div class="grid svelte-1l69wo8"><button class="svelte-1l69wo8">-1y</button> <button class="svelte-1l69wo8">-1m</button> <button class="day svelte-1l69wo8">-1d</button> <p> </p> <button class="day svelte-1l69wo8">+1d</button> <button class="svelte-1l69wo8">+1m</button> <button class="svelte-1l69wo8">+1y</button></div> <p>You can access both the store's state and methods.</p>`, 1);

export default function Store($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const theme = {
		calendar: { width: '600px', shadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }
	};

	let store;
	var fragment = root();
	var node = $.first_child(fragment);

	InlineCalendar(node, {
		get theme() {
			return theme;
		},

		get store() {
			return store;
		},

		set store($$value) {
			store = $$value;
		}
	});

	var div = $.sibling(node, 2);
	var button = $.child(div);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var p = $.sibling(button_2, 2);
	var text = $.only_child(p, true);
	var button_3 = $.sibling(p, 2);
	var button_4 = $.sibling(button_3, 2);
	var button_5 = $.sibling(button_4, 2);

	$.reset(div);
	$.next(2);
	$.template_effect(($0) => $.set_text(text, $0), [() => dayjs($store()?.selected).format('MM/DD/YYYY')]);
	$.event('click', button, () => store.add(-1, 'year'));
	$.event('click', button_1, () => store.add(-1, 'month'));
	$.event('click', button_2, () => store.add(-1, 'day'));
	$.event('click', button_3, () => store.add(1, 'day'));
	$.event('click', button_4, () => store.add(1, 'month'));
	$.event('click', button_5, () => store.add(1, 'year'));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}