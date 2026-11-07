import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Layout, Selector, Input, Badge } from '@appwrite.io/pink-svelte';
import { tick } from 'svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function UpdateUsersLimit($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	let maxUsersInputField = null;
	let value = $.state($.proxy($$props.policy.total !== 0 ? 'limited' : 'unlimited'));
	let newLimit = $.state($.proxy($$props.policy.total !== 0 ? $$props.policy.total : 100));
	const isLimited = $.derived(() => $.get(value) === 'limited');

	const btnDisabled = $.derived(() => {
		return !$.get(isLimited) && $$props.policy.total === 0 || $.get(isLimited) && $$props.policy.total === $.get(newLimit);
	});

	async function updateLimit() {
		try {
			await sdk.forProject($$props.project.region, $$props.project.$id).project.updateUserLimitPolicy({ total: $.get(isLimited) ? $.get(newLimit) : null });
			await invalidate(Dependencies.PROJECT);

			addNotification({
				type: 'success',
				message: 'Updated project users limit successfully'
			});

			trackEvent(Submit.AuthLimitUpdate);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.AuthLimitUpdate);
		}
	}

	$.user_effect(() => {
		if ($.get(isLimited) && maxUsersInputField) {
			tick().then(() => {
				maxUsersInputField.focus();
			});
		}
	});

	CardGrid($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Limit new users from signing up for your project, regardless of authentication method. You can still\n    create users and team memberships from your Appwrite console.');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text('Users limit');

				$.append($$anchor, text_1);
			},

			aside: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
					Layout_Stack($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_1 = $.first_child(fragment_2);

							$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
								Layout_Stack_1($$anchor, {
									direction: 'row',
									alignItems: 'center',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_2 = $.first_child(fragment_3);

										$.component(node_2, () => Selector.Radio, ($$anchor, Selector_Radio) => {
											Selector_Radio($$anchor, {
												name: 'authLimit',
												id: 'unlimited',
												label: 'Unlimited',
												value: 'unlimited',
												get group() {
													return $.get(value);
												},

												set group($$value) {
													$.set(value, $$value, true);
												}
											});
										});

										var node_3 = $.sibling(node_2, 2);

										Badge(node_3, { variant: 'secondary', content: 'Recommended' });
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_1, 2);

							$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
								Layout_Stack_2($$anchor, {
									direction: 'row',
									alignItems: 'center',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_5 = $.first_child(fragment_4);

										$.component(node_5, () => Selector.Radio, ($$anchor, Selector_Radio_1) => {
											Selector_Radio_1($$anchor, {
												name: 'authLimit',
												id: 'limited',
												label: 'Limited',
												value: 'limited',
												get group() {
													return $.get(value);
												},

												set group($$value) {
													$.set(value, $$value, true);
												}
											});
										});

										var node_6 = $.sibling(node_5, 2);

										{
											let $0 = $.derived(() => !$.get(isLimited));

											$.component(node_6, () => Input.Number, ($$anchor, Input_Number) => {
												Input_Number($$anchor, {
													name: 'limit',
													id: 'limit',
													class: 'input-text',
													max: '10000',
													get disabled() {
														return $.get($0);
													},

													get value() {
														return $.get(newLimit);
													},

													set value($$value) {
														$.set(newLimit, $$value, true);
													}
												});
											});
										}

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},

			actions: ($$anchor, $$slotProps) => {
				Button($$anchor, {
					get disabled() {
						return $.get(btnDisabled);
					},

					$$events: {
						click: () => {
							updateLimit();
						}
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Update');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	$.pop();
}