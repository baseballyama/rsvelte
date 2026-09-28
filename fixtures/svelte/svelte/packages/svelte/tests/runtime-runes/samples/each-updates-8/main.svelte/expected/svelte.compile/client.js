import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>first</p>`);
var root_1 = $.from_html(`<!> <p> </p>`, 1);
var root_2 = $.from_html(`<button>Add new message</button> <!>`, 1);

export default function Main($$anchor) {
	let messages = $.proxy([{ id: 1, content: "message 1" }]);

	function add() {
		const newId = messages.length + 1;

		messages.push({ id: 0, tmpId: newId, content: `message ${newId}` });

		queueMicrotask(() => {
			const msg = messages.find((m) => m.tmpId === newId && m.id === 0);

			msg.tmpId = "";
			msg.id = newId;
		});
	}

	var fragment = root_2();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 19, () => messages, (msg) => `${msg.id}_${msg.tmpId ?? ""}`, ($$anchor, msg, i) => {
		var fragment_1 = root_1();
		var node_1 = $.first_child(fragment_1);

		{
			var consequent = ($$anchor) => {
				var p = root();

				$.append($$anchor, p);
			};

			$.if(node_1, ($$render) => {
				if ($.get(i) === 0) $$render(consequent);
			});
		}

		var p_1 = $.sibling(node_1, 2);
		var text = $.only_child(p_1, true);

		$.template_effect(() => $.set_text(text, $.get(msg).content));
		$.append($$anchor, fragment_1);
	});

	$.delegated('click', button, add);
	$.append($$anchor, fragment);
}

$.delegate(['click']);