import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Layout, Selector, Input, Badge } from '@appwrite.io/pink-svelte';
import { tick } from 'svelte';

export default function UpdateUsersLimit($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { project, policy } = $$props;
		let maxUsersInputField = null;
		let value = policy.total !== 0 ? 'limited' : 'unlimited';
		let newLimit = policy.total !== 0 ? policy.total : 100;
		const isLimited = $.derived(() => value === 'limited');

		const btnDisabled = $.derived(() => {
			return !isLimited() && policy.total === 0 || isLimited() && policy.total === newLimit;
		});

		async function updateLimit() {
			try {
				await sdk.forProject(project.region, project.$id).project.updateUserLimitPolicy({ total: isLimited() ? newLimit : null });
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Limit new users from signing up for your project, regardless of authentication method. You can still
    create users and team memberships from your Appwrite console.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Users limit`);
						}
					},

					aside: ($$renderer) => {
						{
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'row',
												alignItems: 'center',
												children: ($$renderer) => {
													if (Selector.Radio) {
														$$renderer.push('<!--[-->');

														Selector.Radio($$renderer, {
															name: 'authLimit',
															id: 'unlimited',
															label: 'Unlimited',
															value: 'unlimited',
															get group() {
																return value;
															},

															set group($$value) {
																value = $$value;
																$$settled = false;
															}
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);
													Badge($$renderer, { variant: 'secondary', content: 'Recommended' });
													$$renderer.push(`<!---->`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'row',
												alignItems: 'center',
												children: ($$renderer) => {
													if (Selector.Radio) {
														$$renderer.push('<!--[-->');

														Selector.Radio($$renderer, {
															name: 'authLimit',
															id: 'limited',
															label: 'Limited',
															value: 'limited',
															get group() {
																return value;
															},

															set group($$value) {
																value = $$value;
																$$settled = false;
															}
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Input.Number) {
														$$renderer.push('<!--[-->');

														Input.Number($$renderer, {
															name: 'limit',
															id: 'limit',
															class: 'input-text',
															max: '10000',
															disabled: !isLimited(),
															get value() {
																return newLimit;
															},

															set value($$value) {
																newLimit = $$value;
																$$settled = false;
															}
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}
					},

					actions: ($$renderer) => {
						{
							Button($$renderer, {
								disabled: btnDisabled(),
								children: ($$renderer) => {
									$$renderer.push(`<!---->Update`);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}