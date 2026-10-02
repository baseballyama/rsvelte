import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { update, release } from './snapshot.remote.ts';

var root = $.from_html(`<form><input/> <button>submit</button></form> <form><button>release</button></form> <p id="status"> </p> <p id="captured"> </p> <p id="live"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let status = $.state('idle');
	let captured = $.state('none');
	let live = $.state('none');
	var fragment = root();
	var form_1 = $.first_child(fragment);

	$.attribute_effect(form_1, ($0) => ({ ...$0 }), [
		() => update.enhance(async (form) => {
			// take a snapshot of the fields *before* doing any async work
			const data = form.fields.value();

			// the submission is held open by the server, giving the test a window
			// to mutate the form state after the snapshot has been taken
			$.set(status, 'submitting');

			await form.submit();
			$.set(status, 'done');

			// the snapshot should reflect the values at the time it was taken, not
			// any changes to the form that happened post-submission
			$.set(captured, data.a?.b?.c, true);

			$.set(live, form.fields.a.b.c.value(), true);
		})
	]);

	var input = $.child(form_1);

	$.attribute_effect(input, ($0) => ({ ...$0 }), [() => update.fields.a.b.c.as('text')], void 0, void 0, void 0, true);
	$.next(2);
	$.reset(form_1);

	var form_2 = $.sibling(form_1, 2);

	$.attribute_effect(form_2, () => ({ ...release }));

	var p = $.sibling(form_2, 2);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);
	var p_2 = $.sibling(p_1, 2);
	var text_2 = $.only_child(p_2);

	$.template_effect(() => {
		$.set_text(text, `status: ${$.get(status) ?? ''}`);
		$.set_text(text_1, `captured: ${$.get(captured) ?? ''}`);
		$.set_text(text_2, `live: ${$.get(live) ?? ''}`);
	});

	$.append($$anchor, fragment);
	$.pop();
}