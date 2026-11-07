import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dump from './Dump.svelte';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div class="errors svelte-jf39l4"> </div>`);
var root_2 = $.from_html(`<form class="flex flex-col svelte-jf39l4" method="POST" action="?/update_ai_show_note"><!> <label for="title">Title</label> <input name="title" id="title"/> <label for="description">Description</label> <textarea name="description" id="description"></textarea> <button>Update</button></form> <!>`, 1);
var root_3 = $.from_html(`<p>Notes not available</p>`);
var root_4 = $.from_html(`<h1 class="h4">DB dump</h1> <p>This is the data that is currently in the DB. No caches.</p> <!> <div class="spotify-sync svelte-jf39l4"><h2 class="h5 svelte-jf39l4">Spotify Sync</h2> <p class="svelte-jf39l4">Sync Spotify data for this episode</p> <!> <form method="POST" action="?/sync_spotify" class="svelte-jf39l4"><button type="submit">Sync Spotify</button></form></div> <h1 class="h4">AI Show Notes</h1> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let formRef = $.state(null);
	let show = $.derived(() => $$props.data.show);

	$.user_effect(() => {
		if ($$props.form) {
			$.get(formRef)?.scrollIntoView({ behavior: 'smooth' });
		}
	});

	var fragment = root_4();
	var node = $.sibling($.first_child(fragment), 4);

	{
		var consequent = ($$anchor) => {
			Dump($$anchor, {
				get data() {
					return $.get(show);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	var div = $.sibling(node, 2);
	var node_1 = $.sibling($.child(div), 4);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root();
			let classes;
			var text = $.only_child(div_1, true);

			$.template_effect(() => {
				classes = $.set_class(div_1, 1, 'sync-message svelte-jf39l4', null, classes, {
					error: !$$props.form?.success,
					success: $$props.form?.success
				});

				$.set_text(text, $$props.form.message);
			});

			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if ($$props.form?.message) $$render(consequent_1);
		});
	}

	$.next(2);
	$.reset(div);

	var node_2 = $.sibling(div, 4);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_2 = root_2();
			var form_1 = $.first_child(fragment_2);
			var node_3 = $.child(form_1);

			{
				var consequent_2 = ($$anchor) => {
					var div_2 = root_1();
					var text_1 = $.only_child(div_2, true);

					$.template_effect(() => $.set_text(text_1, $$props.form?.message));
					$.append($$anchor, div_2);
				};

				$.if(node_3, ($$render) => {
					if ($$props.form?.message) $$render(consequent_2);
				});
			}

			var input = $.sibling(node_3, 4);

			$.remove_input_defaults(input);

			var textarea = $.sibling(input, 4);

			$.remove_textarea_child(textarea);
			$.set_attribute(textarea, 'rows', 4);
			$.next(2);
			$.reset(form_1);
			$.bind_this(form_1, ($$value) => $.set(formRef, $$value), () => $.get(formRef));

			var node_4 = $.sibling(form_1, 2);

			{
				let $0 = $.derived(() => $.get(show)?.aiShowNote);

				Dump(node_4, {
					get data() {
						return $.get($0);
					}
				});
			}

			$.template_effect(() => {
				$.set_value(input, $.get(show)?.aiShowNote.title);
				$.set_value(textarea, $.get(show)?.aiShowNote.description);
			});

			$.append($$anchor, fragment_2);
		};

		var alternate = ($$anchor) => {
			var p = root_3();

			$.append($$anchor, p);
		};

		$.if(node_2, ($$render) => {
			if ($.get(show)?.aiShowNote) $$render(consequent_3); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}