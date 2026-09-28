import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';

var root = $.from_html(`<div></div>`);

export default function EditorContent($$anchor, $$props) {
	$.push($$props, true);

	let rootEl = $.state(void 0);

	$.user_effect(() => {
		if (!$$props.editor || !$.get(rootEl)) {
			return;
		}

		if (!$$props.editor.view.dom?.parentNode) {
			return;
		}

		// Already mounted — avoid re-appending / re-creating on every transaction
		if ($.get(rootEl).contains($$props.editor.view.dom)) {
			return;
		}

		const element = $.get(rootEl);

		untrack(() => {
			const parent = $$props.editor.view.dom.parentNode;

			$.get(rootEl).append(...parent.childNodes);
			$$props.editor.setOptions({ element });
			$$props.editor.createNodeViews();
		});
	});

	var div = root();

	$.bind_this(div, ($$value) => $.set(rootEl, $$value), () => $.get(rootEl));
	$.template_effect(() => $.set_class(div, 1, $.clsx($$props.class)));
	$.append($$anchor, div);
	$.pop();
}