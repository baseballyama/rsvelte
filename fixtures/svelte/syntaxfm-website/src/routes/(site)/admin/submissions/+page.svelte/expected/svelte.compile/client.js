import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { formatDistance } from 'date-fns';
import { queryParameters } from 'sveltekit-search-params';
import SelectMenu from '$/lib/SelectMenu.svelte';
import FormWithLoader from '$/lib/FormWithLoader.svelte';

var root = $.from_html(`<p>No Submissions found</p>`);
var root_1 = $.from_html(`<select name="status" id="status"><option>PENDING</option><option>APPROVED</option><option>COMPLETED</option><option>REJECTED</option></select> <input type="hidden" name="id"/> <button type="submit"> </button>`, 1);
var root_2 = $.from_html(`<input type="hidden" name="id"/> <button class="warning" type="submit"> </button>`, 1);
var root_3 = $.from_html(`<div class="submission svelte-3cf0b5"><h4 class="svelte-3cf0b5"> <span class="pill svelte-3cf0b5"> </span> <span class="pill svelte-3cf0b5"> </span> <span class="pill svelte-3cf0b5"> </span> <span class="pill svelte-3cf0b5"> </span></h4> <textarea class="submission_body svelte-3cf0b5"></textarea> <footer class="svelte-3cf0b5"><!> <!></footer></div>`);
var root_4 = $.from_html(`<h1 class="h4"> </h1> <div class="submission-filter"><nav class="svelte-3cf0b5"><!> <!> <!> <!> <a class="button subtle" href="/admin/submissions">× Clear</a></nav></div> <div class="submissions svelte-3cf0b5"><!></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const store = queryParameters();

	let submissions = $.derived(() => $$props.data.submissions),
		submission_count = $.derived(() => $$props.data.submission_count),
		user_submission_status = $.derived(() => $$props.data.user_submission_status),
		user_submission_type = $.derived(() => $$props.data.user_submission_type);

	var fragment = root_4();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1);
	var div = $.sibling(h1, 2);
	var nav = $.child(div);
	var node = $.child(nav);

	{
		let $0 = $.derived(() => `Type ${$store().submission_type ? `(${$store().submission_type})` : ''}`);
		let $1 = $.derived(() => $store().submission_type || '');

		let $2 = $.derived(() => [
			{ value: '', label: 'All' },
			...Object.keys($.get(user_submission_type)).map((key) => ({ value: key, label: key }))
		]);

		SelectMenu(node, {
			popover_id: 'filter-submission_type',
			onselect: (e) => {
				$.store_mutate(store, $.untrack($store).submission_type = e.detail, $.untrack($store));
			},

			get button_text() {
				return $.get($0);
			},
			button_icon: 'filter',
			get value() {
				return $.get($1);
			},

			get options() {
				return $.get($2);
			}
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => `Status ${$store().status ? `(${$store().status})` : ''}`);
		let $1 = $.derived(() => $store().status || '');

		let $2 = $.derived(() => [
			{ value: '', label: 'All' },
			...Object.keys($.get(user_submission_status)).map((key) => ({ value: key, label: key }))
		]);

		SelectMenu(node_1, {
			popover_id: 'filter-status',
			onselect: (e) => {
				$.store_mutate(store, $.untrack($store).status = e.detail, $.untrack($store));
			},

			get button_text() {
				return $.get($0);
			},
			button_icon: 'filter',
			get value() {
				return $.get($1);
			},

			get options() {
				return $.get($2);
			}
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => $store().perPage?.toString() || '100');

		SelectMenu(node_2, {
			popover_id: 'filter-perPage',
			onselect: (e) => {
				$.store_mutate(store, $.untrack($store).perPage = e.detail, $.untrack($store));
			},
			value_as_label: true,
			button_text: 'Per Page',
			get value() {
				return $.get($0);
			},

			options: [
				{ value: '10', label: '10' },
				{ value: '20', label: '20' },
				{ value: '40', label: '40' },
				{ value: '100', label: '100' }
			]
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		let $0 = $.derived(() => $store().order || 'desc');

		SelectMenu(node_3, {
			popover_id: 'filter-order',
			onselect: (e) => {
				$.store_mutate(store, $.untrack($store).order = e.detail, $.untrack($store));
			},

			get value() {
				return $.get($0);
			},
			button_text: 'Sort',
			button_icon: 'sort',
			options: [
				{ value: 'desc', label: 'Newest To Oldest' },
				{ value: 'asc', label: 'Oldest To Newest' }
			]
		});
	}

	$.next(2);
	$.reset(nav);
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_4 = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_5 = $.first_child(fragment_1);

			$.each(node_5, 17, () => $.get(submissions), $.index, ($$anchor, submission) => {
				var div_2 = root_3();
				let styles;
				var h4 = $.child(div_2);
				var text_1 = $.child(h4);
				var span = $.sibling(text_1);
				var text_2 = $.only_child(span, true);
				var span_1 = $.sibling(span, 2);
				var text_3 = $.only_child(span_1, true);
				var span_2 = $.sibling(span_1, 2);
				var text_4 = $.only_child(span_2, true);
				var span_3 = $.sibling(span_2, 2);
				var text_5 = $.only_child(span_3, true);

				$.reset(h4);

				var textarea = $.sibling(h4, 2);

				$.remove_textarea_child(textarea);

				var footer = $.sibling(textarea, 2);
				var node_6 = $.child(footer);

				{
					const children = ($$anchor, $$arg0) => {
						let loading = () => ($$arg0?.()).loading;
						var fragment_2 = root_1();
						var select = $.first_child(fragment_2);
						var option = $.child(select);

						option.value = option.__value = 'PENDING';

						var option_1 = $.sibling(option);

						option_1.value = option_1.__value = 'APPROVED';

						var option_2 = $.sibling(option_1);

						option_2.value = option_2.__value = 'COMPLETED';

						var option_3 = $.sibling(option_2);

						option_3.value = option_3.__value = 'REJECTED';
						$.reset(select);

						var select_value;

						$.init_select(select);

						var input = $.sibling(select, 2);

						$.remove_input_defaults(input);

						var button = $.sibling(input, 2);

						$.set_style(button, '', {}, { display: 'none' });

						var text_6 = $.only_child(button, true);

						$.template_effect(() => {
							if (select_value !== (select_value = $.get(submission).status)) {
								(
									select.value = (select.__value = select_value) ?? '',
									$.select_option(select, select_value)
								);
							}

							$.set_value(input, $.get(submission).id);
							$.set_text(text_6, loading() ? 'Updating' : 'Update');
						});

						$.delegated('change', select, (e) => {
							e.currentTarget.form?.requestSubmit();
						});

						$.append($$anchor, fragment_2);
					};

					FormWithLoader(node_6, {
						global: false,
						action: '?/update_submission',
						method: 'post',
						children,
						$$slots: { default: true }
					});
				}

				var node_7 = $.sibling(node_6, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let loading = () => ($$arg0?.()).loading;
						var fragment_3 = root_2();
						var input_1 = $.first_child(fragment_3);

						$.remove_input_defaults(input_1);

						var button_1 = $.sibling(input_1, 2);
						var text_7 = $.only_child(button_1, true);

						$.template_effect(() => {
							$.set_value(input_1, $.get(submission).id);
							$.set_text(text_7, loading() ? 'Deleting' : 'Delete');
						});

						$.append($$anchor, fragment_3);
					};

					FormWithLoader(node_7, {
						global: false,
						confirm: 'Are you sure you want to delete this submission?',
						action: '?/delete_submission',
						method: 'post',
						children,
						$$slots: { default: true }
					});
				}

				$.reset(footer);
				$.reset(div_2);

				$.template_effect(
					($0, $1) => {
						styles = $.set_style(div_2, '', styles, {
							'--transition-name': `submission-${$.get(submission).id ?? ''}`
						});

						$.set_text(text_1, `From ${($.get(submission).name || 'Anon') ?? ''} `);
						$.set_text(text_2, $0);
						$.set_text(text_3, $.get(submission).submission_type);
						$.set_text(text_4, $.get(submission).email || 'No Email');
						$.set_text(text_5, $.get(submission).status);

						$.set_value(textarea, `${$1 ?? ''}
				`);
					},
					[
						() => formatDistance(new Date($.get(submission).created_at), new Date(), { addSuffix: true }),
						() => $.get(submission).body.replaceAll('\n', '\n\n').trim()
					]
				);

				$.append($$anchor, div_2);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_4, ($$render) => {
			if (!$.get(submissions)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_1);
	$.template_effect(() => $.set_text(text, `Submissions (${$.get(submission_count) ?? ''})`));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['change']);