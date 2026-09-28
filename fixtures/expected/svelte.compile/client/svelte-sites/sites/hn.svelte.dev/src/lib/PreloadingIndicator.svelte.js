import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<div class="progress-container svelte-1mgdynx"><div class="progress svelte-1mgdynx"></div></div>`);
var root_1 = $.from_html(`<div class="fade svelte-1mgdynx"></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function PreloadingIndicator($$anchor, $$props) {
	$.push($$props, true);

	let p = $.state(0);
	let visible = $.state(false);

	onMount(() => {
		$.set(visible, true);

		function next() {
			$.set(p, $.get(p) + 0.1);

			const remaining = 1 - $.get(p);

			if (remaining > 0.15) setTimeout(next, 500 / remaining);
		}

		setTimeout(next, 250);
	});

	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var div_1 = $.only_child(div);

			$.template_effect(() => $.set_style(div_1, `width: ${$.get(p) * 100}%`));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(visible)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root_1();

			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if ($.get(p) >= 0.4) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}