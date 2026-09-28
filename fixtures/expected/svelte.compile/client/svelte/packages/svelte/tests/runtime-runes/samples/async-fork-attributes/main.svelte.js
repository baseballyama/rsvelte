import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fork } from "svelte";
import { createAttachmentKey } from "svelte/attachments";

var root = $.from_html(`<button>fork</button> <button>commit</button> <p>foo</p> <p>foo</p> <p>foo</p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let style = $.state('');
	let attach = $.state(undefined);
	let forked;
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var p = $.sibling(button_1, 2);

	$.attribute_effect(p, () => ({ ...{ style: $.get(style) } }));

	var p_1 = $.sibling(p, 2);

	$.attribute_effect(p_1, ($0) => ({ ...$0 }), [
		() => ({ style: $.get(style), [createAttachmentKey()]: $.get(attach) })
	]);

	var p_2 = $.sibling(p_1, 2);

	$.attach(p_2, () => $.get(attach));

	$.delegated('click', button, () => {
		forked = fork(() => {
			$.set(style, $.get(style) ? '' : 'color: red', true);

			$.set(
				attach,
				$.get(attach)
					? undefined
					: (node) => {
						node.setAttribute('data-attached', 'true');

						return () => node.removeAttribute('data-attached');
					},
				true
			);
		});
	});

	$.delegated('click', button_1, () => {
		forked.commit();
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);