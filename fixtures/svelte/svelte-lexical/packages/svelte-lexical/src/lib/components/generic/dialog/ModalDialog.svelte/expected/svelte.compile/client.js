import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<dialog class="svelte-fampxd"><div class="svelte-fampxd"><!></div></dialog>`);

export default function ModalDialog($$anchor, $$props) {
	$.push($$props, true);

	let showModal = $.prop($$props, 'showModal', 15),
		stopPropagation = $.prop($$props, 'stopPropagation', 3, true);

	let dialog = $.state(void 0);

	$.user_effect(() => {
		if (!$.get(dialog)) return;

		if (showModal()) {
			$.get(dialog).showModal();
		} else {
			$.get(dialog).close();
		}
	});

	function handleDialogClick(event) {
		if (event.target === event.currentTarget) {
			$.get(dialog)?.close();
		}
	}

	function handleContentClick(event) {
		if (stopPropagation()) {
			event.stopPropagation();
		}

		$$props.onclick?.(event);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var dialog_1 = root();
			var div = $.child(dialog_1);
			var node_1 = $.child(div);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(div);
			$.reset(dialog_1);
			$.bind_this(dialog_1, ($$value) => $.set(dialog, $$value), () => $.get(dialog));
			$.event('close', dialog_1, () => showModal(false));
			$.delegated('click', dialog_1, handleDialogClick);
			$.delegated('click', div, handleContentClick);
			$.append($$anchor, dialog_1);
		};

		$.if(node, ($$render) => {
			if (showModal()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);