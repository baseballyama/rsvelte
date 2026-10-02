import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Datepicker from '$lib/components/Datepicker.svelte';
import { dark } from '$lib/config/theme';
import SvgThing from '$lib/docs/SvgThing.svelte';
import dayjs from 'dayjs';

var root = $.from_html(`<div class="grid svelte-u5cdty"><div class="column-primary svelte-u5cdty"><!> <div class="title-section svelte-u5cdty"><div><h1 class="svelte-u5cdty">SVELTE-CALENDAR</h1> <pre class="svelte-u5cdty">
          npm i -D svelte-calendar
        </pre></div></div></div> <div class="column-secondary svelte-u5cdty"><!></div></div>`);

export default function Routes($$anchor, $$props) {
	$.push($$props, true);

	const start = dayjs().add(-100, 'year').toDate();
	const end = dayjs().add(100, 'year').toDate();
	let selected;
	let store;
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	SvgThing(node, {});
	$.next(2);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	Datepicker(node_1, {
		get defaultTheme() {
			return dark;
		},
		theme: { calendar: { width: '620px' } },
		get start() {
			return start;
		},

		get end() {
			return end;
		},

		get store() {
			return store;
		},

		set store($$value) {
			store = $$value;
		},

		get selected() {
			return selected;
		},

		set selected($$value) {
			selected = $$value;
		}
	});

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}