import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AdminActions from '$/lib/AdminActions.svelte';
import { enhance } from '$app/forms';
import { form_action } from '$lib/form_action';

var root = $.from_html(`<form action="?/import_transcripts" method="post"><button type="submit">Import All Transcripts</button></form> <form action="?/delete_all_transcripts" method="post"><button class="warning" type="submit">Drop All transcripts</button></form> <form action="/webhooks/refresh" method="post"><button class="subtle" type="submit">Test Post</button></form>`, 1);
var root_1 = $.from_html(`<tr><td colspan="4">No Transcripts found</td></tr>`);
var root_2 = $.from_html(`<tr><td> </td><td> </td><td> </td></tr>`);
var root_3 = $.from_html(`<h1 class="h4">Transcripts</h1> <!> <div class="table-container"><table><thead><tr><th>Number</th><th>Name</th><th>Utterance Count</th></tr></thead><tbody><!></tbody></table></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let transcripts = $.derived(() => $$props.data.transcripts);
	var fragment = root_3();
	var node = $.sibling($.first_child(fragment), 2);

	AdminActions(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var form = $.first_child(fragment_1);

			$.action(form, ($$node, $$action_arg) => enhance?.($$node, $$action_arg), form_action);

			var form_1 = $.sibling(form, 2);

			$.action(form_1, ($$node, $$action_arg) => enhance?.($$node, $$action_arg), form_action);
			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var table = $.child(div);
	var tbody = $.sibling($.child(table));
	var node_1 = $.child(tbody);

	{
		var consequent = ($$anchor) => {
			var tr = root_1();

			$.append($$anchor, tr);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.each(node_2, 17, () => $.get(transcripts), $.index, ($$anchor, transcript) => {
				var tr_1 = root_2();
				var td = $.child(tr_1);
				var text = $.only_child(td, true);
				var td_1 = $.sibling(td);
				var text_1 = $.only_child(td_1, true);
				var td_2 = $.sibling(td_1);
				var text_2 = $.only_child(td_2, true);

				$.reset(tr_1);

				$.template_effect(() => {
					$.set_text(text, $.get(transcript).show_number);
					$.set_text(text_1, $.get(transcript).show.title);
					$.set_text(text_2, $.get(transcript)._count.utterances);
				});

				$.append($$anchor, tr_1);
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node_1, ($$render) => {
			if (!$.get(transcripts)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(tbody);
	$.reset(table);
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}