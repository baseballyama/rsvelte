import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';
import Ace from './Ace.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Editor($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);
	let ace = $.state(void 0);

	function editor() {
		return $.get(ace);
	}

	var $$exports = { editor };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.boundary(node, {}, ($$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			var consequent = ($$anchor) => {
				$.bind_this(Ace($$anchor, $.spread_props(() => props)), ($$value) => $.set(ace, $$value, true), () => $.get(ace));
			};

			$.if(node_1, ($$render) => {
				if (browser) $$render(consequent);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}