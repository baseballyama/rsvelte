import * as $ from 'svelte/internal/server';
import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid, PaginationInline } from '$lib/components';
import Confirm from '$lib/components/confirm.svelte';
import { InputPhone, InputOTP, Button } from '$lib/elements/forms';
import { sdk } from '$lib/stores/sdk';
import { getChangePlanUrl } from '$lib/stores/billing';
import { addNotification } from '$lib/stores/notifications';
import { currentPlan } from '$lib/stores/organization';
import { isCloud, isSelfHosted } from '$lib/system';
import MockNumbersLight from './mock-numbers-light.png';
import MockNumbersDark from './mock-numbers-dark.png';
import EmptyCardImageCloud from '$lib/components/emptyCardImageCloud.svelte';
import { app } from '$lib/stores/app';
import Empty from '$lib/components/empty.svelte';
import { Query } from '@appwrite.io/console';
import { Icon, Input, Layout, Link, Spinner, Tooltip } from '@appwrite.io/pink-svelte';
import { IconPlus, IconRefresh, IconTrash } from '@appwrite.io/pink-icons-svelte';

export default function UpdateMockNumbers($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { project } = $$props;
		let savedNumbers = [];
		let draftNumbers = [];
		let isLoadingMockNumbers = false;
		let mockNumbersTotal = 0;
		let mockNumbersOffset = 0;
		const mockNumbersLimit = 10;
		let lastProjectId = null;
		let pendingRow = null;
		let showDeleteConfirm = false;
		let deleteTargetIndex = null;
		let deleteError = null;
		let draftIdCounter = 0;
		const isComponentDisabled = $.derived(() => isSelfHosted || isCloud && !$.store_get($$store_subs ??= {}, '$currentPlan', currentPlan).supportsMockNumbers);

		const emptyStateTitle = $.derived(() => isSelfHosted
			? 'Available on Appwrite Cloud'
			: 'Upgrade to add mock phone numbers');

		const emptyStateDescription = $.derived(() => isSelfHosted
			? 'Sign up for Cloud to add mock phone numbers to your projects.'
			: 'Upgrade to a Pro plan to add mock phone numbers to your project.');

		const cta = $.derived(() => isSelfHosted ? 'Sign up' : 'Upgrade plan');

		function getMockNumberRows(mockNumbers) {
			return mockNumbers.map(({ number, otp }) => ({ number, otp, initialNumber: number, initialOtp: otp }));
		}

		async function loadMockNumbers() {
			try {
				if (savedNumbers.length === 0) {
					isLoadingMockNumbers = true;
				}

				const response = await sdk.forProject(project.region, project.$id).project.listMockPhones({
					queries: [
						Query.limit(mockNumbersLimit),
						Query.offset(mockNumbersOffset)
					]
				});

				if (response.total > 0 && response.mockNumbers.length === 0 && mockNumbersOffset > 0) {
					mockNumbersOffset = Math.floor((response.total - 1) / mockNumbersLimit) * mockNumbersLimit;
					await loadMockNumbers();

					return;
				}

				mockNumbersTotal = response.total;
				savedNumbers = getMockNumberRows(response.mockNumbers ?? []);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.AuthMockNumbersUpdate);
			} finally {
				isLoadingMockNumbers = false;
			}
		}

		function getSavedRowKey(number, index) {
			return number.initialNumber ?? number.number ?? `saved-${index}`;
		}

		function createDraftNumber() {
			draftIdCounter += 1;

			return {
				draftId: `draft-${draftIdCounter}`,
				number: generateNumber(),
				otp: generateOTP()
			};
		}

		function getDraftRowKey(number, index) {
			return number.draftId ?? `draft-${index}`;
		}

		function isSaved(number) {
			return Boolean(number.initialNumber);
		}

		function isValid(number) {
			return number.number?.length >= 9 && number.number?.length <= 16 && (/^[0-9]{6}$/).test(number.otp ?? '');
		}

		function isChanged(number) {
			return !isSaved(number) || number.number !== number.initialNumber || number.otp !== number.initialOtp;
		}

		function setDraftRow(index, nextValue) {
			draftNumbers = draftNumbers.map((row, rowIndex) => rowIndex === index ? nextValue : row);
		}

		async function createPhoneNumber(number, index) {
			const rowKey = getDraftRowKey(number, index);

			try {
				const projectSdk = sdk.forProject(project.region, project.$id).project;

				pendingRow = rowKey;
				await projectSdk.createMockPhone({ number: number.number, otp: number.otp });
				pendingRow = null;
				draftNumbers = draftNumbers.filter((_, rowIndex) => rowIndex !== index);
				await loadMockNumbers();

				addNotification({
					type: 'success',
					message: 'Mock phone numbers have been updated'
				});

				trackEvent(Submit.AuthMockNumbersUpdate);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.AuthMockNumbersUpdate);
			} finally {
				pendingRow = null;
			}
		}

		async function updatePhoneNumber(number, index) {
			if (!number.initialNumber) return;

			const rowKey = getSavedRowKey(number, index);

			try {
				const projectSdk = sdk.forProject(project.region, project.$id).project;

				pendingRow = rowKey;
				await projectSdk.updateMockPhone({ number: number.initialNumber, otp: number.otp });
				await loadMockNumbers();

				addNotification({
					type: 'success',
					message: 'Mock phone numbers have been updated'
				});

				trackEvent(Submit.AuthMockNumbersUpdate);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.AuthMockNumbersUpdate);
			} finally {
				pendingRow = null;
			}
		}

		async function deletePhoneNumber(number, index) {
			if (!number.initialNumber) {
				draftNumbers = draftNumbers.filter((_, rowIndex) => rowIndex !== index);

				return;
			}

			const rowKey = getSavedRowKey(number, index);

			try {
				const projectSdk = sdk.forProject(project.region, project.$id).project;

				pendingRow = rowKey;
				await projectSdk.deleteMockPhone({ number: number.initialNumber });
				savedNumbers = savedNumbers.filter((row) => row.initialNumber !== number.initialNumber);
				await loadMockNumbers();

				addNotification({
					type: 'success',
					message: 'Mock phone number has been deleted'
				});

				trackEvent(Submit.AuthMockNumbersUpdate);
			} catch(error) {
				deleteError = error.message;
				trackError(error, Submit.AuthMockNumbersUpdate);
			} finally {
				pendingRow = null;
			}
		}

		function addPhoneNumber() {
			draftNumbers = [...draftNumbers, createDraftNumber()];
		}

		function generateNumber() {
			const areaCode = Math.floor(Math.random() * 800) + 200;
			const lineNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

			return `+1${areaCode}555${lineNumber}`;
		}

		function generateOTP() {
			return String(Math.floor(100000 + Math.random() * 900000));
		}

		function getDeleteTargetRow() {
			return deleteTargetIndex === null ? null : savedNumbers[deleteTargetIndex] ?? null;
		}

		function isDeletePending() {
			const row = getDeleteTargetRow();

			return row !== null && deleteTargetIndex !== null && pendingRow === getSavedRowKey(row, deleteTargetIndex);
		}

		function promptDelete(index) {
			deleteTargetIndex = index;
			deleteError = null;
			showDeleteConfirm = true;
		}

		async function confirmDeletePhoneNumber() {
			const row = getDeleteTargetRow();

			if (row === null || deleteTargetIndex === null) return;

			deleteError = null;
			await deletePhoneNumber(row, deleteTargetIndex);

			if (!deleteError) {
				showDeleteConfirm = false;
				deleteTargetIndex = null;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				hideFooter: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Generate <b>fictional</b> numbers to simulate phone verification when testing demo accounts for
    submitting your application to the App Store or Google Play. `);

					if (Link.Anchor) {
						$$renderer.push('<!--[-->');

						Link.Anchor($$renderer, {
							href: 'https://appwrite.io/docs/products/auth/security#mock-phone-numbers',
							target: '_blank',
							rel: 'noopener noreferrer',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Learn more`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Mock phone numbers`);
						}
					},

					aside: ($$renderer) => {
						{
							if (isComponentDisabled()) {
								$$renderer.push('<!--[0-->');

								EmptyCardImageCloud($$renderer, {
									responsive: true,
									source: 'email_signature_card',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(emptyStateDescription())}`);
									},

									$$slots: {
										default: true,
										image: ($$renderer) => {
											{
												$$renderer.push(`<div class="is-only-mobile u-width-full-line u-height-100-percent">`);

												if ($.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark') {
													$$renderer.push(`<!--[0--><img${$.attr('src', MockNumbersDark)} class="u-image-object-fit-cover u-only-dark u-width-full-line u-height-100-percent" alt="Mock Numbers Example"/>`);
												} else {
													$$renderer.push(`<!--[-1--><img${$.attr('src', MockNumbersLight)} class="u-image-object-fit-cover u-only-light u-width-full-line u-height-100-percent" alt="Mock Numbers Example"/>`);
												}

												$$renderer.push(`<!--]--></div> <div class="is-not-mobile"${$.attr_style('', { 'background-color': 'var(--bgcolor-neutral-default)' })}>`);

												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														justifyContent: 'center',
														direction: 'row',
														children: ($$renderer) => {
															if ($.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark') {
																$$renderer.push(`<!--[0--><img${$.attr('src', MockNumbersDark)} width="266" alt="Mock Numbers Example"${$.attr_style('', { 'object-position': 'top' })}/>`);
															} else {
																$$renderer.push(`<!--[-1--><img${$.attr('src', MockNumbersLight)} width="266" alt="Mock Numbers Example"${$.attr_style('', { 'object-position': 'top' })}/>`);
															}

															$$renderer.push(`<!--]-->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(`</div>`);
											}
										},

										title: ($$renderer) => {
											{
												$$renderer.push(`${$.escape(emptyStateTitle())}`);
											}
										},

										cta: ($$renderer, { source }) => {
											{
												Button($$renderer, {
													secondary: true,
													fullWidth: true,
													external: isSelfHosted,
													href: isCloud
														? getChangePlanUrl(project.teamId)
														: 'https://cloud.appwrite.io/register',

													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(cta())}`);
													},
													$$slots: { default: true }
												});
											}
										}
									}
								});
							} else if (isLoadingMockNumbers) {
								$$renderer.push('<!--[1-->');

								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										direction: 'row',
										justifyContent: 'center',
										children: ($$renderer) => {
											Spinner($$renderer, {});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else if (savedNumbers.length > 0 || draftNumbers.length > 0) {
								$$renderer.push(`<!--[2--><!--[-->`);

								const each_array = $.ensure_array_like(savedNumbers);

								for (let index = 0, $$length = each_array.length; index < $$length; index++) {
									let number = each_array[index];

									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											direction: 'row',
											alignItems: 'flex-end',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														direction: 'row',
														alignItems: 'flex-end',
														gap: 'xs',
														children: ($$renderer) => {
															InputPhone($$renderer, {
																id: `saved-key-${index}`,
																placeholder: 'Enter phone number',
																label: index === 0 ? 'Phone number' : undefined,
																minlength: 9,
																maxlength: 16,
																disabled: isSaved(number),
																required: true,
																get value() {
																	return number.number;
																},

																set value($$value) {
																	number.number = $$value;
																	$$settled = false;
																}
															});
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
														alignItems: 'flex-end',
														gap: 'xs',
														children: ($$renderer) => {
															InputOTP($$renderer, {
																id: `saved-value-${index}`,
																placeholder: 'Enter value',
																label: index === 0 ? 'Verification code' : undefined,
																maxlength: 6,
																pattern: '^[0-9]{6}$',
																patternError: 'The value must contain 6 digits',
																required: true,
																get value() {
																	return number.otp;
																},

																set value($$value) {
																	number.otp = $$value;
																	$$settled = false;
																},

																$$slots: {
																	end: ($$renderer) => {
																		Tooltip($$renderer, {
																			slot: 'end',
																			children: ($$renderer) => {
																				if (Input.Action) {
																					$$renderer.push('<!--[-->');
																					Input.Action($$renderer, { icon: IconRefresh });
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			},

																			$$slots: {
																				default: true,
																				tooltip: ($$renderer) => {
																					$$renderer.push(`<span slot="tooltip">Regenerate</span>`);
																				}
																			}
																		});
																	}
																}
															});

															$$renderer.push(`<!----> `);

															if (isSaved(number)) {
																$$renderer.push('<!--[0-->');

																Button($$renderer, {
																	compact: true,
																	disabled: !isChanged(number) || !isValid(number) || pendingRow === getSavedRowKey(number, index),
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Save`);
																	},
																	$$slots: { default: true }
																});
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]--> `);

															Button($$renderer, {
																icon: true,
																text: true,
																disabled: pendingRow === getSavedRowKey(number, index),
																ariaLabel: 'Delete mock phone number',
																children: ($$renderer) => {
																	Icon($$renderer, { icon: IconTrash, size: 's' });
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!----> `);

															if (pendingRow === getSavedRowKey(number, index)) {
																$$renderer.push(`<!--[0--><span${$.attr_style('', { opacity: '0.75' })}>`);
																Spinner($$renderer, { size: 's' });
																$$renderer.push(`<!----></span>`);
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]-->`);
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

								$$renderer.push(`<!--]--> <!--[-->`);

								const each_array_1 = $.ensure_array_like(draftNumbers);

								for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
									let number = each_array_1[index];

									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											direction: 'row',
											alignItems: 'flex-end',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														direction: 'row',
														alignItems: 'flex-end',
														gap: 'xs',
														children: ($$renderer) => {
															InputPhone($$renderer, {
																id: `draft-key-${index}`,
																placeholder: 'Enter phone number',
																label: mockNumbersTotal === 0 && index === 0 ? 'Phone number' : undefined,
																minlength: 9,
																maxlength: 16,
																required: true,
																get value() {
																	return number.number;
																},

																set value($$value) {
																	number.number = $$value;
																	$$settled = false;
																},

																$$slots: {
																	end: ($$renderer) => {
																		Tooltip($$renderer, {
																			slot: 'end',
																			children: ($$renderer) => {
																				if (Input.Action) {
																					$$renderer.push('<!--[-->');
																					Input.Action($$renderer, { icon: IconRefresh });
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			},

																			$$slots: {
																				default: true,
																				tooltip: ($$renderer) => {
																					$$renderer.push(`<span slot="tooltip">Regenerate</span>`);
																				}
																			}
																		});
																	}
																}
															});
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
														alignItems: 'flex-end',
														gap: 'xs',
														children: ($$renderer) => {
															InputOTP($$renderer, {
																id: `draft-value-${index}`,
																placeholder: 'Enter value',
																label: mockNumbersTotal === 0 && index === 0 ? 'Verification code' : undefined,
																maxlength: 6,
																pattern: '^[0-9]{6}$',
																patternError: 'The value must contain 6 digits',
																required: true,
																get value() {
																	return number.otp;
																},

																set value($$value) {
																	number.otp = $$value;
																	$$settled = false;
																},

																$$slots: {
																	end: ($$renderer) => {
																		Tooltip($$renderer, {
																			slot: 'end',
																			children: ($$renderer) => {
																				if (Input.Action) {
																					$$renderer.push('<!--[-->');
																					Input.Action($$renderer, { icon: IconRefresh });
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			},

																			$$slots: {
																				default: true,
																				tooltip: ($$renderer) => {
																					$$renderer.push(`<span slot="tooltip">Regenerate</span>`);
																				}
																			}
																		});
																	}
																}
															});

															$$renderer.push(`<!----> `);

															Button($$renderer, {
																compact: true,
																disabled: !isValid(number) || pendingRow === getDraftRowKey(number, index),
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Save`);
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!----> `);

															Button($$renderer, {
																icon: true,
																text: true,
																disabled: pendingRow === getDraftRowKey(number, index),
																ariaLabel: 'Delete mock phone number',
																children: ($$renderer) => {
																	Icon($$renderer, { icon: IconTrash, size: 's' });
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!----> `);

															if (pendingRow === getDraftRowKey(number, index)) {
																$$renderer.push(`<!--[0--><span${$.attr_style('', { opacity: '0.75' })}>`);
																Spinner($$renderer, { size: 's' });
																$$renderer.push(`<!----></span>`);
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]-->`);
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

								$$renderer.push(`<!--]--> `);

								if (mockNumbersTotal + draftNumbers.length < 10) {
									$$renderer.push(`<!--[0--><div>`);

									Button($$renderer, {
										secondary: true,
										disabled: mockNumbersTotal + draftNumbers.length >= 10,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Add number`);
										},

										$$slots: {
											default: true,
											start: ($$renderer) => {
												Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
											}
										}
									});

									$$renderer.push(`<!----></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (mockNumbersTotal > mockNumbersLimit) {
									$$renderer.push('<!--[0-->');

									PaginationInline($$renderer, {
										limit: mockNumbersLimit,
										total: mockNumbersTotal,
										get offset() {
											return mockNumbersOffset;
										},

										set offset($$value) {
											mockNumbersOffset = $$value;
											$$settled = false;
										}
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							} else {
								$$renderer.push('<!--[-1-->');

								Empty($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Add a number`);
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						}
					}
				}
			});

			$$renderer.push(`<!----> `);

			Confirm($$renderer, {
				title: 'Delete mock phone number',
				action: 'Delete',
				submissionLoader: true,
				disabled: isDeletePending(),
				onSubmit: confirmDeletePhoneNumber,
				get open() {
					return showDeleteConfirm;
				},

				set open($$value) {
					showDeleteConfirm = $$value;
					$$settled = false;
				},

				get error() {
					return deleteError;
				},

				set error($$value) {
					deleteError = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (getDeleteTargetRow()) {
						$$renderer.push(`<!--[0--><p>Are you sure you want to delete <b>${$.escape(getDeleteTargetRow()?.initialNumber)}</b>?</p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}