import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(
	`Generate <b>fictional</b> numbers to simulate phone verification when testing demo accounts for
    submitting your application to the App Store or Google Play. <!>`,
	1
);

var root_1 = $.from_html(`<img class="u-image-object-fit-cover u-only-dark u-width-full-line u-height-100-percent" alt="Mock Numbers Example"/>`);
var root_2 = $.from_html(`<img class="u-image-object-fit-cover u-only-light u-width-full-line u-height-100-percent" alt="Mock Numbers Example"/>`);
var root_3 = $.from_html(`<img width="266" alt="Mock Numbers Example"/>`);
var root_4 = $.from_html(`<div class=" is-only-mobile u-width-full-line u-height-100-percent"><!></div> <div class="is-not-mobile"><!></div>`, 1);
var root_5 = $.from_html(`<span slot="tooltip">Regenerate</span>`);
var root_6 = $.from_html(`<span><!></span>`);
var root_7 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<!> <!>`, 1);
var root_9 = $.from_html(`<div><!></div>`);
var root_10 = $.from_html(`<p>Are you sure you want to delete <b> </b>?</p>`);

export default function UpdateMockNumbers($$anchor, $$props) {
	$.push($$props, true);

	const $currentPlan = () => $.store_get(currentPlan, '$currentPlan', $$stores);
	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let savedNumbers = $.state($.proxy([]));
	let draftNumbers = $.state($.proxy([]));
	let isLoadingMockNumbers = $.state(false);
	let mockNumbersTotal = $.state(0);
	let mockNumbersOffset = $.state(0);
	const mockNumbersLimit = 10;
	let lastProjectId = $.state(null);
	let pendingRow = $.state(null);
	let showDeleteConfirm = $.state(false);
	let deleteTargetIndex = $.state(null);
	let deleteError = $.state(null);
	let draftIdCounter = $.state(0);
	const isComponentDisabled = $.derived(() => isSelfHosted || isCloud && !$currentPlan().supportsMockNumbers);

	const emptyStateTitle = $.derived(() => isSelfHosted
		? 'Available on Appwrite Cloud'
		: 'Upgrade to add mock phone numbers');

	const emptyStateDescription = $.derived(() => isSelfHosted
		? 'Sign up for Cloud to add mock phone numbers to your projects.'
		: 'Upgrade to a Pro plan to add mock phone numbers to your project.');

	const cta = $.derived(() => isSelfHosted ? 'Sign up' : 'Upgrade plan');

	$.user_effect(() => {
		const id = $$props.project?.$id ?? null;

		if (id && id !== $.get(lastProjectId)) {
			$.set(lastProjectId, id, true);
			void loadMockNumbers();
		}
	});

	function getMockNumberRows(mockNumbers) {
		return mockNumbers.map(({ number, otp }) => ({ number, otp, initialNumber: number, initialOtp: otp }));
	}

	async function loadMockNumbers() {
		try {
			if ($.get(savedNumbers).length === 0) {
				$.set(isLoadingMockNumbers, true);
			}

			const response = await sdk.forProject($$props.project.region, $$props.project.$id).project.listMockPhones({
				queries: [
					Query.limit(mockNumbersLimit),
					Query.offset($.get(mockNumbersOffset))
				]
			});

			if (response.total > 0 && response.mockNumbers.length === 0 && $.get(mockNumbersOffset) > 0) {
				$.set(mockNumbersOffset, Math.floor((response.total - 1) / mockNumbersLimit) * mockNumbersLimit);
				await loadMockNumbers();

				return;
			}

			$.set(mockNumbersTotal, response.total, true);
			$.set(savedNumbers, getMockNumberRows(response.mockNumbers ?? []), true);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.AuthMockNumbersUpdate);
		} finally {
			$.set(isLoadingMockNumbers, false);
		}
	}

	function getSavedRowKey(number, index) {
		return number.initialNumber ?? number.number ?? `saved-${index}`;
	}

	function createDraftNumber() {
		$.set(draftIdCounter, $.get(draftIdCounter) + 1);

		return {
			draftId: `draft-${$.get(draftIdCounter)}`,
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
		$.set(draftNumbers, $.get(draftNumbers).map((row, rowIndex) => rowIndex === index ? nextValue : row), true);
	}

	async function createPhoneNumber(number, index) {
		const rowKey = getDraftRowKey(number, index);

		try {
			const projectSdk = sdk.forProject($$props.project.region, $$props.project.$id).project;

			$.set(pendingRow, rowKey, true);
			await projectSdk.createMockPhone({ number: number.number, otp: number.otp });
			$.set(pendingRow, null);
			$.set(draftNumbers, $.get(draftNumbers).filter((_, rowIndex) => rowIndex !== index), true);
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
			$.set(pendingRow, null);
		}
	}

	async function updatePhoneNumber(number, index) {
		if (!number.initialNumber) return;

		const rowKey = getSavedRowKey(number, index);

		try {
			const projectSdk = sdk.forProject($$props.project.region, $$props.project.$id).project;

			$.set(pendingRow, rowKey, true);
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
			$.set(pendingRow, null);
		}
	}

	async function deletePhoneNumber(number, index) {
		if (!number.initialNumber) {
			$.set(draftNumbers, $.get(draftNumbers).filter((_, rowIndex) => rowIndex !== index), true);

			return;
		}

		const rowKey = getSavedRowKey(number, index);

		try {
			const projectSdk = sdk.forProject($$props.project.region, $$props.project.$id).project;

			$.set(pendingRow, rowKey, true);
			await projectSdk.deleteMockPhone({ number: number.initialNumber });
			$.set(savedNumbers, $.get(savedNumbers).filter((row) => row.initialNumber !== number.initialNumber), true);
			await loadMockNumbers();

			addNotification({
				type: 'success',
				message: 'Mock phone number has been deleted'
			});

			trackEvent(Submit.AuthMockNumbersUpdate);
		} catch(error) {
			$.set(deleteError, error.message, true);
			trackError(error, Submit.AuthMockNumbersUpdate);
		} finally {
			$.set(pendingRow, null);
		}
	}

	function addPhoneNumber() {
		$.set(draftNumbers, [...$.get(draftNumbers), createDraftNumber()], true);
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
		return $.get(deleteTargetIndex) === null
			? null
			: $.get(savedNumbers)[$.get(deleteTargetIndex)] ?? null;
	}

	function isDeletePending() {
		const row = getDeleteTargetRow();

		return row !== null && $.get(deleteTargetIndex) !== null && $.get(pendingRow) === getSavedRowKey(row, $.get(deleteTargetIndex));
	}

	function promptDelete(index) {
		$.set(deleteTargetIndex, index, true);
		$.set(deleteError, null);
		$.set(showDeleteConfirm, true);
	}

	async function confirmDeletePhoneNumber() {
		const row = getDeleteTargetRow();

		if (row === null || $.get(deleteTargetIndex) === null) return;

		$.set(deleteError, null);
		await deletePhoneNumber(row, $.get(deleteTargetIndex));

		if (!$.get(deleteError)) {
			$.set(showDeleteConfirm, false);
			$.set(deleteTargetIndex, null);
		}
	}

	var fragment = root_8();
	var node = $.first_child(fragment);

	CardGrid(node, {
		hideFooter: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1), 3);

			$.component(node_1, () => Link.Anchor, ($$anchor, Link_Anchor) => {
				Link_Anchor($$anchor, {
					href: 'https://appwrite.io/docs/products/auth/security#mock-phone-numbers',
					target: '_blank',
					rel: 'noopener noreferrer',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Learn more');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text('Mock phone numbers');

				$.append($$anchor, text_1);
			},

			aside: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				{
					var consequent_2 = ($$anchor) => {
						EmptyCardImageCloud($$anchor, {
							responsive: true,
							source: 'email_signature_card',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text();

								$.template_effect(() => $.set_text(text_2, $.get(emptyStateDescription)));
								$.append($$anchor, text_2);
							},

							$$slots: {
								default: true,
								image: ($$anchor, $$slotProps) => {
									var fragment_5 = root_4();
									var div = $.first_child(fragment_5);
									var node_3 = $.child(div);

									{
										var consequent = ($$anchor) => {
											var img = root_1();

											$.template_effect(() => $.set_attribute(img, 'src', MockNumbersDark));
											$.append($$anchor, img);
										};

										var alternate = ($$anchor) => {
											var img_1 = root_2();

											$.template_effect(() => $.set_attribute(img_1, 'src', MockNumbersLight));
											$.append($$anchor, img_1);
										};

										$.if(node_3, ($$render) => {
											if ($app().themeInUse === 'dark') $$render(consequent); else $$render(alternate, -1);
										});
									}

									$.reset(div);

									var div_1 = $.sibling(div, 2);

									$.set_style(div_1, '', {}, { 'background-color': 'var(--bgcolor-neutral-default)' });

									var node_4 = $.child(div_1);

									$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack) => {
										Layout_Stack($$anchor, {
											justifyContent: 'center',
											direction: 'row',
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = $.comment();
												var node_5 = $.first_child(fragment_6);

												{
													var consequent_1 = ($$anchor) => {
														var img_2 = root_3();

														$.set_style(img_2, '', {}, { 'object-position': 'top' });
														$.template_effect(() => $.set_attribute(img_2, 'src', MockNumbersDark));
														$.append($$anchor, img_2);
													};

													var alternate_1 = ($$anchor) => {
														var img_3 = root_3();

														$.set_style(img_3, '', {}, { 'object-position': 'top' });
														$.template_effect(() => $.set_attribute(img_3, 'src', MockNumbersLight));
														$.append($$anchor, img_3);
													};

													$.if(node_5, ($$render) => {
														if ($app().themeInUse === 'dark') $$render(consequent_1); else $$render(alternate_1, -1);
													});
												}

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_1);
									$.append($$anchor, fragment_5);
								},

								title: ($$anchor, $$slotProps) => {
									var text_3 = $.text();

									$.template_effect(() => $.set_text(text_3, $.get(emptyStateTitle)));
									$.append($$anchor, text_3);
								},

								cta: ($$anchor, $$slotProps) => {
									const source = $.derived(() => $$slotProps.source);

									{
										let $0 = $.derived(() => isCloud
											? getChangePlanUrl($$props.project.teamId)
											: 'https://cloud.appwrite.io/register');

										Button($$anchor, {
											secondary: true,
											fullWidth: true,
											get external() {
												return isSelfHosted;
											},

											get href() {
												return $.get($0);
											},

											$$events: {
												click: () => {
													trackEvent(Click.CloudSignupClick, { from: 'button', source: $.get(source) });
												}
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text();

												$.template_effect(() => $.set_text(text_4, $.get(cta)));
												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									}
								}
							}
						});
					};

					var consequent_3 = ($$anchor) => {
						var fragment_10 = $.comment();
						var node_6 = $.first_child(fragment_10);

						$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								direction: 'row',
								justifyContent: 'center',
								children: ($$anchor, $$slotProps) => {
									Spinner($$anchor, {});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_10);
					};

					var consequent_9 = ($$anchor) => {
						var fragment_12 = root_7();
						var node_7 = $.first_child(fragment_12);

						$.each(node_7, 19, () => $.get(savedNumbers), (number, index) => getSavedRowKey(number, index), ($$anchor, number, index) => {
							var fragment_13 = $.comment();
							var node_8 = $.first_child(fragment_13);

							$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
								Layout_Stack_2($$anchor, {
									direction: 'row',
									alignItems: 'flex-end',
									children: ($$anchor, $$slotProps) => {
										var fragment_14 = root_8();
										var node_9 = $.first_child(fragment_14);

										$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
											Layout_Stack_3($$anchor, {
												direction: 'row',
												alignItems: 'flex-end',
												gap: 'xs',
												children: ($$anchor, $$slotProps) => {
													{
														let $0 = $.derived(() => `saved-key-${$.get(index)}`);
														let $1 = $.derived(() => $.get(index) === 0 ? 'Phone number' : undefined);
														let $2 = $.derived(() => isSaved($.get(number)));

														InputPhone($$anchor, {
															get id() {
																return $.get($0);
															},
															placeholder: 'Enter phone number',
															get label() {
																return $.get($1);
															},
															minlength: 9,
															maxlength: 16,
															get disabled() {
																return $.get($2);
															},
															required: true,
															get value() {
																return $.get(number).number;
															},

															set value($$value) {
																($.get(number).number = $$value);
															}
														});
													}
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_9, 2);

										$.component(node_10, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
											Layout_Stack_4($$anchor, {
												direction: 'row',
												alignItems: 'flex-end',
												gap: 'xs',
												children: ($$anchor, $$slotProps) => {
													var fragment_16 = root_7();
													var node_11 = $.first_child(fragment_16);

													{
														let $0 = $.derived(() => `saved-value-${$.get(index)}`);
														let $1 = $.derived(() => $.get(index) === 0 ? 'Verification code' : undefined);

														InputOTP(node_11, {
															get id() {
																return $.get($0);
															},
															placeholder: 'Enter value',
															get label() {
																return $.get($1);
															},
															maxlength: 6,
															pattern: '^[0-9]{6}$',
															patternError: 'The value must contain 6 digits',
															required: true,
															get value() {
																return $.get(number).otp;
															},

															set value($$value) {
																($.get(number).otp = $$value);
															},

															$$slots: {
																end: ($$anchor, $$slotProps) => {
																	Tooltip($$anchor, {
																		slot: 'end',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_18 = $.comment();
																			var node_12 = $.first_child(fragment_18);

																			$.component(node_12, () => Input.Action, ($$anchor, Input_Action) => {
																				Input_Action($$anchor, {
																					get icon() {
																						return IconRefresh;
																					},
																					$$events: { click: () => ($.get(number).otp = generateOTP()) }
																				});
																			});

																			$.append($$anchor, fragment_18);
																		},

																		$$slots: {
																			default: true,
																			tooltip: ($$anchor, $$slotProps) => {
																				var span = root_5();

																				$.append($$anchor, span);
																			}
																		}
																	});
																}
															}
														});
													}

													var node_13 = $.sibling(node_11, 2);

													{
														var consequent_4 = ($$anchor) => {
															{
																let $0 = $.derived(() => !isChanged($.get(number)) || !isValid($.get(number)) || $.get(pendingRow) === getSavedRowKey($.get(number), $.get(index)));

																Button($$anchor, {
																	compact: true,
																	get disabled() {
																		return $.get($0);
																	},
																	$$events: { click: () => updatePhoneNumber($.get(number), $.get(index)) },
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_5 = $.text('Save');

																		$.append($$anchor, text_5);
																	},
																	$$slots: { default: true }
																});
															}
														};

														var d = $.derived(() => isSaved($.get(number)));

														$.if(node_13, ($$render) => {
															if ($.get(d)) $$render(consequent_4);
														});
													}

													var node_14 = $.sibling(node_13, 2);

													{
														let $0 = $.derived(() => $.get(pendingRow) === getSavedRowKey($.get(number), $.get(index)));

														Button(node_14, {
															icon: true,
															text: true,
															get disabled() {
																return $.get($0);
															},
															ariaLabel: 'Delete mock phone number',
															$$events: { click: () => promptDelete($.get(index)) },
															children: ($$anchor, $$slotProps) => {
																Icon($$anchor, {
																	get icon() {
																		return IconTrash;
																	},
																	size: 's'
																});
															},
															$$slots: { default: true }
														});
													}

													var node_15 = $.sibling(node_14, 2);

													{
														var consequent_5 = ($$anchor) => {
															var span_1 = root_6();

															$.set_style(span_1, '', {}, { opacity: '0.75' });

															var node_16 = $.child(span_1);

															Spinner(node_16, { size: 's' });
															$.reset(span_1);
															$.append($$anchor, span_1);
														};

														var d_1 = $.derived(() => $.get(pendingRow) === getSavedRowKey($.get(number), $.get(index)));

														$.if(node_15, ($$render) => {
															if ($.get(d_1)) $$render(consequent_5);
														});
													}

													$.append($$anchor, fragment_16);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_14);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_13);
						});

						var node_17 = $.sibling(node_7, 2);

						$.each(node_17, 19, () => $.get(draftNumbers), (number, index) => getDraftRowKey(number, index), ($$anchor, number, index) => {
							var fragment_21 = $.comment();
							var node_18 = $.first_child(fragment_21);

							$.component(node_18, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
								Layout_Stack_5($$anchor, {
									direction: 'row',
									alignItems: 'flex-end',
									children: ($$anchor, $$slotProps) => {
										var fragment_22 = root_8();
										var node_19 = $.first_child(fragment_22);

										$.component(node_19, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
											Layout_Stack_6($$anchor, {
												direction: 'row',
												alignItems: 'flex-end',
												gap: 'xs',
												children: ($$anchor, $$slotProps) => {
													{
														let $0 = $.derived(() => `draft-key-${$.get(index)}`);
														let $1 = $.derived(() => $.get(mockNumbersTotal) === 0 && $.get(index) === 0 ? 'Phone number' : undefined);

														InputPhone($$anchor, {
															get id() {
																return $.get($0);
															},
															placeholder: 'Enter phone number',
															get label() {
																return $.get($1);
															},
															minlength: 9,
															maxlength: 16,
															required: true,
															get value() {
																return $.get(number).number;
															},

															set value($$value) {
																($.get(number).number = $$value);
															},

															$$slots: {
																end: ($$anchor, $$slotProps) => {
																	Tooltip($$anchor, {
																		slot: 'end',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_25 = $.comment();
																			var node_20 = $.first_child(fragment_25);

																			$.component(node_20, () => Input.Action, ($$anchor, Input_Action_1) => {
																				Input_Action_1($$anchor, {
																					get icon() {
																						return IconRefresh;
																					},

																					$$events: {
																						click: () => setDraftRow($.get(index), { ...$.get(number), number: generateNumber() })
																					}
																				});
																			});

																			$.append($$anchor, fragment_25);
																		},

																		$$slots: {
																			default: true,
																			tooltip: ($$anchor, $$slotProps) => {
																				var span_2 = root_5();

																				$.append($$anchor, span_2);
																			}
																		}
																	});
																}
															}
														});
													}
												},
												$$slots: { default: true }
											});
										});

										var node_21 = $.sibling(node_19, 2);

										$.component(node_21, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
											Layout_Stack_7($$anchor, {
												direction: 'row',
												alignItems: 'flex-end',
												gap: 'xs',
												children: ($$anchor, $$slotProps) => {
													var fragment_26 = root_7();
													var node_22 = $.first_child(fragment_26);

													{
														let $0 = $.derived(() => `draft-value-${$.get(index)}`);
														let $1 = $.derived(() => $.get(mockNumbersTotal) === 0 && $.get(index) === 0 ? 'Verification code' : undefined);

														InputOTP(node_22, {
															get id() {
																return $.get($0);
															},
															placeholder: 'Enter value',
															get label() {
																return $.get($1);
															},
															maxlength: 6,
															pattern: '^[0-9]{6}$',
															patternError: 'The value must contain 6 digits',
															required: true,
															get value() {
																return $.get(number).otp;
															},

															set value($$value) {
																($.get(number).otp = $$value);
															},

															$$slots: {
																end: ($$anchor, $$slotProps) => {
																	Tooltip($$anchor, {
																		slot: 'end',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_28 = $.comment();
																			var node_23 = $.first_child(fragment_28);

																			$.component(node_23, () => Input.Action, ($$anchor, Input_Action_2) => {
																				Input_Action_2($$anchor, {
																					get icon() {
																						return IconRefresh;
																					},

																					$$events: {
																						click: () => setDraftRow($.get(index), { ...$.get(number), otp: generateOTP() })
																					}
																				});
																			});

																			$.append($$anchor, fragment_28);
																		},

																		$$slots: {
																			default: true,
																			tooltip: ($$anchor, $$slotProps) => {
																				var span_3 = root_5();

																				$.append($$anchor, span_3);
																			}
																		}
																	});
																}
															}
														});
													}

													var node_24 = $.sibling(node_22, 2);

													{
														let $0 = $.derived(() => !isValid($.get(number)) || $.get(pendingRow) === getDraftRowKey($.get(number), $.get(index)));

														Button(node_24, {
															compact: true,
															get disabled() {
																return $.get($0);
															},
															$$events: { click: () => createPhoneNumber($.get(number), $.get(index)) },
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_6 = $.text('Save');

																$.append($$anchor, text_6);
															},
															$$slots: { default: true }
														});
													}

													var node_25 = $.sibling(node_24, 2);

													{
														let $0 = $.derived(() => $.get(pendingRow) === getDraftRowKey($.get(number), $.get(index)));

														Button(node_25, {
															icon: true,
															text: true,
															get disabled() {
																return $.get($0);
															},
															ariaLabel: 'Delete mock phone number',
															$$events: { click: () => deletePhoneNumber($.get(number), $.get(index)) },
															children: ($$anchor, $$slotProps) => {
																Icon($$anchor, {
																	get icon() {
																		return IconTrash;
																	},
																	size: 's'
																});
															},
															$$slots: { default: true }
														});
													}

													var node_26 = $.sibling(node_25, 2);

													{
														var consequent_6 = ($$anchor) => {
															var span_4 = root_6();

															$.set_style(span_4, '', {}, { opacity: '0.75' });

															var node_27 = $.child(span_4);

															Spinner(node_27, { size: 's' });
															$.reset(span_4);
															$.append($$anchor, span_4);
														};

														var d_2 = $.derived(() => $.get(pendingRow) === getDraftRowKey($.get(number), $.get(index)));

														$.if(node_26, ($$render) => {
															if ($.get(d_2)) $$render(consequent_6);
														});
													}

													$.append($$anchor, fragment_26);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_22);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_21);
						});

						var node_28 = $.sibling(node_17, 2);

						{
							var consequent_7 = ($$anchor) => {
								var div_2 = root_9();
								var node_29 = $.child(div_2);

								{
									let $0 = $.derived(() => $.get(mockNumbersTotal) + $.get(draftNumbers).length >= 10);

									Button(node_29, {
										secondary: true,
										get disabled() {
											return $.get($0);
										},
										$$events: { click: addPhoneNumber },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('Add number');

											$.append($$anchor, text_7);
										},

										$$slots: {
											default: true,
											start: ($$anchor, $$slotProps) => {
												Icon($$anchor, {
													get icon() {
														return IconPlus;
													},
													slot: 'start',
													size: 's'
												});
											}
										}
									});
								}

								$.reset(div_2);
								$.append($$anchor, div_2);
							};

							$.if(node_28, ($$render) => {
								if ($.get(mockNumbersTotal) + $.get(draftNumbers).length < 10) $$render(consequent_7);
							});
						}

						var node_30 = $.sibling(node_28, 2);

						{
							var consequent_8 = ($$anchor) => {
								PaginationInline($$anchor, {
									limit: mockNumbersLimit,
									get total() {
										return $.get(mockNumbersTotal);
									},

									get offset() {
										return $.get(mockNumbersOffset);
									},

									set offset($$value) {
										$.set(mockNumbersOffset, $$value, true);
									},
									$$events: { change: loadMockNumbers }
								});
							};

							$.if(node_30, ($$render) => {
								if ($.get(mockNumbersTotal) > mockNumbersLimit) $$render(consequent_8);
							});
						}

						$.append($$anchor, fragment_12);
					};

					var alternate_2 = ($$anchor) => {
						Empty($$anchor, {
							$$events: { click: addPhoneNumber },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_8 = $.text('Add a number');

								$.append($$anchor, text_8);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_2, ($$render) => {
						if ($.get(isComponentDisabled)) $$render(consequent_2); else if ($.get(isLoadingMockNumbers)) $$render(consequent_3, 1); else if ($.get(savedNumbers).length > 0 || $.get(draftNumbers).length > 0) $$render(consequent_9, 2); else $$render(alternate_2, -1);
					});
				}

				$.append($$anchor, fragment_2);
			}
		}
	});

	var node_31 = $.sibling(node, 2);

	{
		let $0 = $.derived(isDeletePending);

		Confirm(node_31, {
			title: 'Delete mock phone number',
			action: 'Delete',
			submissionLoader: true,
			get disabled() {
				return $.get($0);
			},
			onSubmit: confirmDeletePhoneNumber,
			get open() {
				return $.get(showDeleteConfirm);
			},

			set open($$value) {
				$.set(showDeleteConfirm, $$value, true);
			},

			get error() {
				return $.get(deleteError);
			},

			set error($$value) {
				$.set(deleteError, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_33 = $.comment();
				var node_32 = $.first_child(fragment_33);

				{
					var consequent_10 = ($$anchor) => {
						var p = root_10();
						var b = $.sibling($.child(p));
						var text_9 = $.only_child(b, true);

						$.next();
						$.reset(p);
						$.template_effect(($0) => $.set_text(text_9, $0), [() => getDeleteTargetRow()?.initialNumber]);
						$.append($$anchor, p);
					};

					var d_3 = $.derived(() => getDeleteTargetRow());

					$.if(node_32, ($$render) => {
						if ($.get(d_3)) $$render(consequent_10);
					});
				}

				$.append($$anchor, fragment_33);
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}