import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from "svelte";
import Notices from "./Notices.svelte";
import Modal from "./Modal.svelte";
import { uid } from "@svar-ui/lib-dom";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Globals($$anchor, $$props) {
	$.push($$props, true);

	let modal = $.state(null);

	function showModal(msg) {
		$.set(modal, { ...msg }, true);

		return new Promise((res, rej) => {
			$.get(modal).resolve = (v) => {
				$.set(modal, null);
				res(v);
			};

			$.get(modal).reject = (v) => {
				$.set(modal, null);
				rej(v);
			};
		});
	}

	let notices = $.state($.proxy([]));

	function showNotice(msg) {
		msg = { ...msg };
		msg.id = msg.id || uid();
		msg.remove = () => $.set(notices, $.get(notices).filter((a) => a.id !== msg.id), true);

		if (msg.expire != -1) {
			setTimeout(msg.remove, msg.expire || 5100);
		}

		$.set(notices, [...$.get(notices), msg], true);
	}

	setContext("wx-helpers", { showNotice, showModal });

	var fragment = root();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			Modal($$anchor, {
				get title() {
					return $.get(modal).title;
				},

				get buttons() {
					return $.get(modal).buttons;
				},

				get onconfirm() {
					return $.get(modal).resolve;
				},

				get oncancel() {
					return $.get(modal).reject;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(modal).message));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_1, ($$render) => {
			if ($.get(modal)) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	Notices(node_2, {
		get data() {
			return $.get(notices);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}