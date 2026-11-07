import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Transcript from '$lib/transcript/Transcript.svelte';

var root = $.from_html(`<p>Transcript not available yet! We have the AI robots on the job, check back soon!</p>`);

export default function _page($$anchor, $$props) {
	let transcript = $.derived(() => $$props.data.transcript),
		show = $.derived(() => $$props.data.show);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Transcript($$anchor, {
				get show() {
					return $.get(show);
				},

				get aiShowNote() {
					return $.get(show).aiShowNote;
				},

				get transcript() {
					return $.get(transcript);
				}
			});
		};

		var alternate = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($.get(transcript)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}