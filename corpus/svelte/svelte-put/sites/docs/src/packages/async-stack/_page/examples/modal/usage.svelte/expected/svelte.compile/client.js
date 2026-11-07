import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { modalStack } from './modal-stack';

var root = $.from_html(`<p class="text-sm font-bold text-green-500">We have an accord.</p>`);
var root_1 = $.from_html(`<p class="text-sm font-bold text-red-500">We don't have an accord.</p>`);
var root_2 = $.from_html(`<div class="not-prose flex items-center gap-2"><button class="c-btn">Trigger Modal</button> <!></div>`);

export default function Usage($$anchor, $$props) {
	$.push($$props, true);

	let confirmed = undefined;

	async function confirm() {
		const pushed = modalStack.push('confirm');

		({ confirmed } = await pushed.resolution ?? {});
	}

	var div = root_2();
	var button = $.child(div);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		var consequent_1 = ($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		};

		$.if(node, ($$render) => {
			if (confirmed === true) $$render(consequent); else if (confirmed === false) $$render(consequent_1, 1);
		});
	}

	$.reset(div);
	$.delegated('click', button, confirm);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);