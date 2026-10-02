import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AdminActions from '$/lib/AdminActions.svelte';
import AdminSearch from '$/lib/AdminSearch.svelte';
import { dev } from '$app/environment';
import { enhance } from '$app/forms';
import FormWithLoader from '$lib/FormWithLoader.svelte';
import { form_action } from '$lib/form_action';
import { format } from 'date-fns';

var root = $.from_html(`<button class="warning">Drop All Shows</button>`);
var root_1 = $.from_html(`<p class="small" style="position: absolute; top: -120%; width: auto; white-space: nowrap;">This will delete all shows, guests, transcripts (utterance, word and transcripts)</p> <button type="submit" class="warning">For real, drop um'</button>`, 1);
var root_2 = $.from_html(`<form action="?/delete_all_shows" method="post" style="position: relative;"><!></form>`);
var root_3 = $.from_html(`<form action="?/import_all_shows" method="POST"><button type="submit">Sync Changed/New Shows</button></form> <form action="?/refresh_all" method="POST"><button class="subtle" type="submit">Sync All Shows</button></form> <form action="/webhooks/refresh" method="GET"><button class="subtle" type="submit">Test Refresh Webhook</button></form> <!>`, 1);
var root_4 = $.from_html(`<input type="hidden" name="show_number"/> <button class="warning" type="submit"> </button>`, 1);
var root_5 = $.from_html(`✅ <!>`, 1);
var root_6 = $.from_html(`<input type="hidden" name="show_number"/> <button type="submit"> </button>`, 1);
var root_7 = $.from_html(`✅ <button type="submit"> </button>`, 1);
var root_8 = $.from_html(`<button type="submit"> </button>`);
var root_9 = $.from_html(`<fieldset class="svelte-19oyn9c"><input type="hidden" name="show_number"/> <!></fieldset>`);
var root_10 = $.from_html(`<tr class="svelte-19oyn9c"><td><a> </a></td><td><a target="_blank"> </a> <br/> <span class="text-xs"> </span></td><td><!></td><td class="center svelte-19oyn9c"> </td><td class="center svelte-19oyn9c"><!></td><td class="center svelte-19oyn9c"><!></td></tr>`);
var root_11 = $.from_html(`<h1 class="h4">Shows</h1> <!> <div><!> <div class="table-container"><table><thead><tr class="svelte-19oyn9c"><th>Number</th><th>Title</th><th>Type</th><th>Guests</th><th>Transcript</th><th>AI Notes</th></tr></thead><tbody></tbody></table></div></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let shows = $.derived(() => $$props.data.shows);
	let confirm = $.state(false);
	let search_text = $.state('');
	var fragment = root_11();
	var node = $.sibling($.first_child(fragment), 2);

	AdminActions(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var form = $.first_child(fragment_1);

			$.action(form, ($$node, $$action_arg) => enhance?.($$node, $$action_arg), form_action);

			var form_1 = $.sibling(form, 2);

			$.action(form_1, ($$node, $$action_arg) => enhance?.($$node, $$action_arg), form_action);

			var node_1 = $.sibling(form_1, 4);

			{
				var consequent_1 = ($$anchor) => {
					var form_2 = root_2();
					var node_2 = $.child(form_2);

					{
						var consequent = ($$anchor) => {
							var button = root();

							$.delegated('click', button, () => {
								$.set(confirm, true);
							});

							$.append($$anchor, button);
						};

						var alternate = ($$anchor) => {
							var fragment_2 = root_1();

							$.next(2);
							$.append($$anchor, fragment_2);
						};

						$.if(node_2, ($$render) => {
							if (!$.get(confirm)) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.reset(form_2);
					$.action(form_2, ($$node, $$action_arg) => enhance?.($$node, $$action_arg), form_action);
					$.append($$anchor, form_2);
				};

				$.if(node_1, ($$render) => {
					if (dev) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_3 = $.child(div);

	AdminSearch(node_3, {
		get text() {
			return $.get(search_text);
		},

		set text($$value) {
			$.set(search_text, $$value, true);
		}
	});

	var div_1 = $.sibling(node_3, 2);
	var table = $.child(div_1);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 21, () => $.get(shows).filter((s) => s.title.toLowerCase().includes($.get(search_text).toLowerCase())), $.index, ($$anchor, show) => {
		var tr = root_10();
		var td = $.child(tr);
		var a = $.child(td);
		var text = $.only_child(a);

		$.reset(td);

		var td_1 = $.sibling(td);
		var a_1 = $.child(td_1);
		var text_1 = $.only_child(a_1);
		var span = $.sibling(a_1, 4);
		var text_2 = $.only_child(span);

		$.reset(td_1);

		var td_2 = $.sibling(td_1);
		var node_4 = $.child(td_2);

		{
			var consequent_2 = ($$anchor) => {
				var text_3 = $.text('Hasty');

				$.append($$anchor, text_3);
			};

			var d = $.derived(() => format($.get(show).date, 'EEE') === 'Mon');

			var consequent_3 = ($$anchor) => {
				var text_4 = $.text('Tasty');

				$.append($$anchor, text_4);
			};

			var d_1 = $.derived(() => format($.get(show).date, 'EEE') === 'Wed');

			var consequent_4 = ($$anchor) => {
				var text_5 = $.text('Supper Club');

				$.append($$anchor, text_5);
			};

			var d_2 = $.derived(() => format($.get(show).date, 'EEE') === 'Fri');

			$.if(node_4, ($$render) => {
				if ($.get(d)) $$render(consequent_2); else if ($.get(d_1)) $$render(consequent_3, 1); else if ($.get(d_2)) $$render(consequent_4, 2);
			});
		}

		$.reset(td_2);

		var td_3 = $.sibling(td_2);
		var text_6 = $.only_child(td_3, true);
		var td_4 = $.sibling(td_3);
		var node_5 = $.child(td_4);

		{
			var consequent_5 = ($$anchor) => {
				var fragment_3 = root_5();
				var node_6 = $.sibling($.first_child(fragment_3));

				{
					const children = ($$anchor, $$arg0) => {
						let loading = () => ($$arg0?.()).loading;
						var fragment_4 = root_4();
						var input = $.first_child(fragment_4);

						$.remove_input_defaults(input);

						var button_1 = $.sibling(input, 2);
						var text_7 = $.only_child(button_1, true);

						$.template_effect(() => {
							$.set_value(input, $.get(show).number);
							$.set_text(text_7, loading() ? 'Deleting' : 'Delete');
						});

						$.append($$anchor, fragment_4);
					};

					FormWithLoader(node_6, {
						global: false,
						action: '?/delete_transcript',
						method: 'post',
						children,
						$$slots: { default: true }
					});
				}

				$.append($$anchor, fragment_3);
			};

			var alternate_1 = ($$anchor) => {
				{
					const children = ($$anchor, $$arg0) => {
						let loading = () => ($$arg0?.()).loading;
						var fragment_6 = root_6();
						var input_1 = $.first_child(fragment_6);

						$.remove_input_defaults(input_1);

						var button_2 = $.sibling(input_1, 2);
						var text_8 = $.only_child(button_2);

						$.template_effect(() => {
							$.set_value(input_1, $.get(show).number);
							$.set_text(text_8, `Fetch${loading() ? 'ing' : ''}`);
						});

						$.append($$anchor, fragment_6);
					};

					FormWithLoader($$anchor, {
						global: false,
						action: '?/fetch_show_transcript',
						method: 'post',
						children,
						$$slots: { default: true }
					});
				}
			};

			$.if(node_5, ($$render) => {
				if ($.get(show).transcript) $$render(consequent_5); else $$render(alternate_1, -1);
			});
		}

		$.reset(td_4);

		var td_5 = $.sibling(td_4);
		var node_7 = $.child(td_5);

		{
			const children = ($$anchor, $$arg0) => {
				let loading = () => ($$arg0?.()).loading;
				var fieldset = root_9();
				var input_2 = $.child(fieldset);

				$.remove_input_defaults(input_2);

				var node_8 = $.sibling(input_2, 2);

				{
					var consequent_6 = ($$anchor) => {
						var fragment_7 = root_7();
						var button_3 = $.sibling($.first_child(fragment_7));
						var text_9 = $.only_child(button_3);

						$.template_effect(() => $.set_text(text_9, `Refetch${loading() ? 'ing' : ''}`));
						$.append($$anchor, fragment_7);
					};

					var alternate_2 = ($$anchor) => {
						var button_4 = root_8();
						var text_10 = $.only_child(button_4);

						$.template_effect(() => $.set_text(text_10, `Fetch${loading() ? 'ing' : ''}`));
						$.append($$anchor, button_4);
					};

					$.if(node_8, ($$render) => {
						if ($.get(show).aiShowNote) $$render(consequent_6); else $$render(alternate_2, -1);
					});
				}

				$.reset(fieldset);

				$.template_effect(() => {
					fieldset.disabled = loading();
					$.set_value(input_2, $.get(show).number);
				});

				$.append($$anchor, fieldset);
			};

			FormWithLoader(node_7, {
				global: false,
				action: '?/fetch_AI_notes',
				method: 'post',
				children,
				$$slots: { default: true }
			});
		}

		$.reset(td_5);
		$.reset(tr);

		$.template_effect(
			($0, $1) => {
				$.set_attribute(a, 'href', `/admin/shows/${$.get(show).number ?? ''}`);
				$.set_text(text, `#${$.get(show).number ?? ''}`);
				$.set_attribute(a_1, 'href', `/${$.get(show).number ?? ''}`);

				$.set_text(text_1, `${$.get(show).title ?? ''}
								[↗]`);

				$.set_text(text_2, `${$0 ?? ''}
								${$1 ?? ''}`);

				$.set_text(text_6, $.get(show)._count.guests);
			},
			[
				() => $.get(show).date.getTime() > Date.now() ? 'Scheduled' : 'Published',
				() => format($.get(show).date, 'EEE MMM d yyyy h:mm:ss a z')
			]
		);

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);