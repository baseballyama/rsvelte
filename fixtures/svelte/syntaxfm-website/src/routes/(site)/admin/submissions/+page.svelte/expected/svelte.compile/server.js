import * as $ from 'svelte/internal/server';
import { formatDistance } from 'date-fns';
import { queryParameters } from 'sveltekit-search-params';
import SelectMenu from '$/lib/SelectMenu.svelte';
import FormWithLoader from '$/lib/FormWithLoader.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const store = queryParameters();
		let { data } = $$props;

		let submissions = $.derived(() => data.submissions),
			submission_count = $.derived(() => data.submission_count),
			user_submission_status = $.derived(() => data.user_submission_status),
			user_submission_type = $.derived(() => data.user_submission_type);

		$$renderer.push(`<h1 class="h4">Submissions (${$.escape(submission_count())})</h1> <div class="submission-filter"><nav class="svelte-3cf0b5">`);

		SelectMenu($$renderer, {
			popover_id: 'filter-submission_type',
			onselect: (e) => {
				$.store_mutate($$store_subs ??= {}, '$store', store, $.store_get($$store_subs ??= {}, '$store', store).submission_type = e.detail);
			},

			button_text: `Type ${$.store_get($$store_subs ??= {}, '$store', store).submission_type
				? `(${$.store_get($$store_subs ??= {}, '$store', store).submission_type})`
				: ''}`,
			button_icon: 'filter',
			value: $.store_get($$store_subs ??= {}, '$store', store).submission_type || '',
			options: [
				{ value: '', label: 'All' },
				...Object.keys(user_submission_type()).map((key) => ({ value: key, label: key }))
			]
		});

		$$renderer.push(`<!----> `);

		SelectMenu($$renderer, {
			popover_id: 'filter-status',
			onselect: (e) => {
				$.store_mutate($$store_subs ??= {}, '$store', store, $.store_get($$store_subs ??= {}, '$store', store).status = e.detail);
			},

			button_text: `Status ${$.store_get($$store_subs ??= {}, '$store', store).status
				? `(${$.store_get($$store_subs ??= {}, '$store', store).status})`
				: ''}`,
			button_icon: 'filter',
			value: $.store_get($$store_subs ??= {}, '$store', store).status || '',
			options: [
				{ value: '', label: 'All' },
				...Object.keys(user_submission_status()).map((key) => ({ value: key, label: key }))
			]
		});

		$$renderer.push(`<!----> `);

		SelectMenu($$renderer, {
			popover_id: 'filter-perPage',
			onselect: (e) => {
				$.store_mutate($$store_subs ??= {}, '$store', store, $.store_get($$store_subs ??= {}, '$store', store).perPage = e.detail);
			},
			value_as_label: true,
			button_text: 'Per Page',
			value: $.store_get($$store_subs ??= {}, '$store', store).perPage?.toString() || '100',
			options: [
				{ value: '10', label: '10' },
				{ value: '20', label: '20' },
				{ value: '40', label: '40' },
				{ value: '100', label: '100' }
			]
		});

		$$renderer.push(`<!----> `);

		SelectMenu($$renderer, {
			popover_id: 'filter-order',
			onselect: (e) => {
				$.store_mutate($$store_subs ??= {}, '$store', store, $.store_get($$store_subs ??= {}, '$store', store).order = e.detail);
			},
			value: $.store_get($$store_subs ??= {}, '$store', store).order || 'desc',
			button_text: 'Sort',
			button_icon: 'sort',
			options: [
				{ value: 'desc', label: 'Newest To Oldest' },
				{ value: 'asc', label: 'Oldest To Newest' }
			]
		});

		$$renderer.push(`<!----> <a class="button subtle" href="/admin/submissions">× Clear</a></nav></div> <div class="submissions svelte-3cf0b5">`);

		if (!submissions()) {
			$$renderer.push(`<!--[0--><p>No Submissions found</p>`);
		} else {
			$$renderer.push(`<!--[-1--><!--[-->`);

			const each_array = $.ensure_array_like(submissions());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let submission = each_array[$$index];

				$$renderer.push(`<div class="submission svelte-3cf0b5"${$.attr_style('', {
					'--transition-name': `submission-${$.stringify(submission.id)}`
				})}><h4 class="svelte-3cf0b5">From ${$.escape(submission.name || 'Anon')} <span class="pill svelte-3cf0b5">${$.escape(formatDistance(new Date(submission.created_at), new Date(), { addSuffix: true }))}</span> <span class="pill svelte-3cf0b5">${$.escape(submission.submission_type)}</span> <span class="pill svelte-3cf0b5">${$.escape(submission.email || 'No Email')}</span> <span class="pill svelte-3cf0b5">${$.escape(submission.status)}</span></h4> <textarea class="submission_body svelte-3cf0b5">`);

				const $$body = $.escape(`${$.stringify(submission.body.replaceAll('\n', '\n\n').trim())}
				`);

				if ($$body) {
					$$renderer.push(`${$$body}`);
				} else {}

				$$renderer.push(`</textarea> <footer class="svelte-3cf0b5">`);

				{
					function children($$renderer, { loading }) {
						$$renderer.select(
							{
								name: 'status',
								id: 'status',
								value: submission.status,
								onchange: (e) => {
									e.currentTarget.form?.requestSubmit();
								}
							},
							($$renderer) => {
								$$renderer.option({ value: 'PENDING' }, ($$renderer) => {
									$$renderer.push(`PENDING`);
								});

								$$renderer.option({ value: 'APPROVED' }, ($$renderer) => {
									$$renderer.push(`APPROVED`);
								});

								$$renderer.option({ value: 'COMPLETED' }, ($$renderer) => {
									$$renderer.push(`COMPLETED`);
								});

								$$renderer.option({ value: 'REJECTED' }, ($$renderer) => {
									$$renderer.push(`REJECTED`);
								});
							}
						);

						$$renderer.push(` <input type="hidden" name="id"${$.attr('value', submission.id)}/> <button type="submit"${$.attr_style('', { display: 'none' })}>${$.escape(loading ? 'Updating' : 'Update')}</button>`);
					}

					FormWithLoader($$renderer, {
						global: false,
						action: '?/update_submission',
						method: 'post',
						children,
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { loading }) {
						$$renderer.push(`<input type="hidden" name="id"${$.attr('value', submission.id)}/> <button class="warning" type="submit">${$.escape(loading ? 'Deleting' : 'Delete')}</button>`);
					}

					FormWithLoader($$renderer, {
						global: false,
						confirm: 'Are you sure you want to delete this submission?',
						action: '?/delete_submission',
						method: 'post',
						children,
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!----></footer></div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}