import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useOptions } from '../options.svelte.js';
import HtmlViewFull from './HTMLViewFull.svelte';
import HtmlViewSimple from './HTMLViewSimple.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function HTMLView($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);
	const options = useOptions();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			HtmlViewSimple($$anchor, $.spread_props(() => props));
		};

		var alternate = ($$anchor) => {
			HtmlViewFull($$anchor, $.spread_props(() => props));
		};

		$.if(node, ($$render) => {
			if (options.value.elementView === 'simple') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}