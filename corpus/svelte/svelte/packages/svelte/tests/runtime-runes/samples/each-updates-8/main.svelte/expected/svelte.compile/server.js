import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let messages = [{ id: 1, content: "message 1" }];

	function add() {
		const newId = messages.length + 1;

		messages.push({ id: 0, tmpId: newId, content: `message ${newId}` });

		queueMicrotask(() => {
			const msg = messages.find((m) => m.tmpId === newId && m.id === 0);

			msg.tmpId = "";
			msg.id = newId;
		});
	}

	$$renderer.push(`<button>Add new message</button> <!--[-->`);

	const each_array = $.ensure_array_like(messages);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let msg = each_array[i];

		if (i === 0) {
			$$renderer.push(`<!--[0--><p>first</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <p>${$.escape(msg.content)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}