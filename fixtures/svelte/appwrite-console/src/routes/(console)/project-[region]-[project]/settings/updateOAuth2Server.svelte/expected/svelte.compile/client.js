import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputNumber, InputTags, InputText } from '$lib/elements/forms';
import InputSelect from '$lib/elements/forms/inputSelect.svelte';
import { addNotification } from '$lib/stores/notifications';
import { canWriteProjects } from '$lib/stores/roles';
import { sdk } from '$lib/stores/sdk';
import { Divider, Icon, Layout, Selector, Tooltip, Typography } from '@appwrite.io/pink-svelte';
import { IconInfo } from '@appwrite.io/pink-icons-svelte';
import deepEqual from 'deep-equal';
import { project } from '../store';

var root = $.from_html(`<span slot="tooltip">The consent screen URL shown to users during the OAuth2 authorization
                            flow.</span>`);

var root_1 = $.from_html(`<span slot="tooltip">OAuth2 scopes this server will accept. Up to 100 scopes, each up to 128
                            characters long.</span>`);

var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <div class="duration-field svelte-4wcrp9"><!> <!></div> <div class="duration-field svelte-4wcrp9"><!> <!></div> <!> <!> <!> <div class="duration-field svelte-4wcrp9"><!> <!></div> <div class="duration-field svelte-4wcrp9"><!> <!></div>`, 1);

export default function UpdateOAuth2Server($$anchor, $$props) {
	$.push($$props, true);

	const $canWriteProjects = () => $.store_get(canWriteProjects, '$canWriteProjects', $$stores);
	const $project = () => $.store_get(project, '$project', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const multipliers = { seconds: 1, minutes: 60, hours: 3600, days: 86400 };

	const unitOptions = [
		{ value: 'seconds', label: 'Seconds' },
		{ value: 'minutes', label: 'Minutes' },
		{ value: 'hours', label: 'Hours' },
		{ value: 'days', label: 'Days' }
	];

	function fromSeconds(s, defaultUnit = 'hours') {
		if (s === null) return { value: null, unit: defaultUnit };
		if (s % 86400 === 0) return { value: s / 86400, unit: 'days' };
		if (s % 3600 === 0) return { value: s / 3600, unit: 'hours' };
		if (s % 60 === 0) return { value: s / 60, unit: 'minutes' };

		return { value: s, unit: 'seconds' };
	}

	function toSeconds(value, unit) {
		return value !== null ? value * multipliers[unit] : null;
	}

	let enabled = $.state(false);
	let authorizationUrl = $.state('');
	let scopes = $.state($.proxy([]));
	let accessTokenValue = $.state(null);
	let accessTokenUnit = $.state('hours');
	let refreshTokenValue = $.state(null);
	let refreshTokenUnit = $.state('days');
	let publicAccessTokenValue = $.state(null);
	let publicAccessTokenUnit = $.state('hours');
	let publicRefreshTokenValue = $.state(null);
	let publicRefreshTokenUnit = $.state('days');
	let confidentialPkce = $.state(false);
	const accessTokenDuration = $.derived(() => toSeconds($.get(accessTokenValue), $.get(accessTokenUnit)));
	const refreshTokenDuration = $.derived(() => toSeconds($.get(refreshTokenValue), $.get(refreshTokenUnit)));
	const publicAccessTokenDuration = $.derived(() => toSeconds($.get(publicAccessTokenValue), $.get(publicAccessTokenUnit)));
	const publicRefreshTokenDuration = $.derived(() => toSeconds($.get(publicRefreshTokenValue), $.get(publicRefreshTokenUnit)));

	const isButtonDisabled = $.derived(() => !$canWriteProjects() || deepEqual(
		{
			enabled: $.get(enabled),
			authorizationUrl: $.get(authorizationUrl),
			scopes: $.get(scopes),
			accessTokenDuration: $.get(accessTokenDuration),
			refreshTokenDuration: $.get(refreshTokenDuration),
			publicAccessTokenDuration: $.get(publicAccessTokenDuration),
			publicRefreshTokenDuration: $.get(publicRefreshTokenDuration),
			confidentialPkce: $.get(confidentialPkce)
		},
		{
			enabled: $project().oAuth2ServerEnabled ?? false,
			authorizationUrl: $project().oAuth2ServerAuthorizationUrl ?? '',
			scopes: $project().oAuth2ServerScopes ?? [],
			accessTokenDuration: $project().oAuth2ServerAccessTokenDuration ?? null,
			refreshTokenDuration: $project().oAuth2ServerRefreshTokenDuration ?? null,
			publicAccessTokenDuration: $project().oAuth2ServerPublicAccessTokenDuration ?? null,
			publicRefreshTokenDuration: $project().oAuth2ServerPublicRefreshTokenDuration ?? null,
			confidentialPkce: $project().oAuth2ServerConfidentialPkce ?? false
		}
	));

	async function update() {
		try {
			await sdk.forProject($project().region, $project().$id).project.updateOAuth2Server({
				enabled: $.get(enabled),
				authorizationUrl: $.get(authorizationUrl),
				scopes: $.get(scopes),
				accessTokenDuration: $.get(accessTokenDuration) ?? undefined,
				refreshTokenDuration: $.get(refreshTokenDuration) ?? undefined,
				publicAccessTokenDuration: $.get(publicAccessTokenDuration) ?? undefined,
				publicRefreshTokenDuration: $.get(publicRefreshTokenDuration) ?? undefined,
				confidentialPkce: $.get(confidentialPkce)
			});

			await invalidate(Dependencies.PROJECT);

			addNotification({
				type: 'success',
				message: 'OAuth2 server settings have been updated.'
			});

			trackEvent(Submit.ProjectUpdateOAuth2Server);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.ProjectUpdateOAuth2Server);
		}
	}

	$.user_effect(() => {
		$.set(enabled, $project().oAuth2ServerEnabled ?? false, true);
		$.set(authorizationUrl, $project().oAuth2ServerAuthorizationUrl ?? '', true);
		$.set(scopes, $project().oAuth2ServerScopes ?? [], true);

		const at = fromSeconds($project().oAuth2ServerAccessTokenDuration ?? null, 'hours');

		$.set(accessTokenValue, at.value, true);
		$.set(accessTokenUnit, at.unit, true);

		const rt = fromSeconds($project().oAuth2ServerRefreshTokenDuration ?? null, 'days');

		$.set(refreshTokenValue, rt.value, true);
		$.set(refreshTokenUnit, rt.unit, true);

		const pat = fromSeconds($project().oAuth2ServerPublicAccessTokenDuration ?? null, 'hours');

		$.set(publicAccessTokenValue, pat.value, true);
		$.set(publicAccessTokenUnit, pat.unit, true);

		const prt = fromSeconds($project().oAuth2ServerPublicRefreshTokenDuration ?? null, 'days');

		$.set(publicRefreshTokenValue, prt.value, true);
		$.set(publicRefreshTokenUnit, prt.unit, true);
		$.set(confidentialPkce, $project().oAuth2ServerConfidentialPkce ?? false, true);
	});

	Form($$anchor, {
		onSubmit: update,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Configure your project as an OAuth2 authorization server. When enabled, external applications\n        can authenticate users through your project using the OAuth2 protocol.');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('OAuth2 server');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => !$canWriteProjects());

							$.component(node, () => Selector.Switch, ($$anchor, Selector_Switch) => {
								Selector_Switch($$anchor, {
									id: 'oauth2-server-enabled',
									label: 'Enable OAuth2 server',
									description: 'Allow external applications to authenticate users through your project.',
									get disabled() {
										return $.get($0);
									},

									get checked() {
										return $.get(enabled);
									},

									set checked($$value) {
										$.set(enabled, $$value, true);
									}
								});
							});
						}

						var node_1 = $.sibling(node, 2);

						{
							var consequent = ($$anchor) => {
								var fragment_3 = root_3();
								var node_2 = $.first_child(fragment_3);

								{
									let $0 = $.derived(() => !$canWriteProjects());

									InputText(node_2, {
										id: 'oauth2-authorization-url',
										label: 'Authorization URL',
										required: true,
										placeholder: 'https://example.com/consent',
										get disabled() {
											return $.get($0);
										},

										get value() {
											return $.get(authorizationUrl);
										},

										set value($$value) {
											$.set(authorizationUrl, $$value, true);
										},

										$$slots: {
											info: ($$anchor, $$slotProps) => {
												Tooltip($$anchor, {
													slot: 'info',
													children: ($$anchor, $$slotProps) => {
														Icon($$anchor, {
															get icon() {
																return IconInfo;
															},
															size: 's'
														});
													},

													$$slots: {
														default: true,
														tooltip: ($$anchor, $$slotProps) => {
															var span = root();

															$.append($$anchor, span);
														}
													}
												});
											}
										}
									});
								}

								var node_3 = $.sibling(node_2, 2);

								{
									let $0 = $.derived(() => !$canWriteProjects());

									InputTags(node_3, {
										id: 'oauth2-scopes',
										label: 'Scopes',
										placeholder: 'e.g. profile',
										max: 100,
										get disabled() {
											return $.get($0);
										},

										get tags() {
											return $.get(scopes);
										},

										set tags($$value) {
											$.set(scopes, $$value, true);
										},

										$$slots: {
											info: ($$anchor, $$slotProps) => {
												Tooltip($$anchor, {
													slot: 'info',
													children: ($$anchor, $$slotProps) => {
														Icon($$anchor, {
															get icon() {
																return IconInfo;
															},
															size: 's'
														});
													},

													$$slots: {
														default: true,
														tooltip: ($$anchor, $$slotProps) => {
															var span_1 = root_1();

															$.append($$anchor, span_1);
														}
													}
												});
											}
										}
									});
								}

								var node_4 = $.sibling(node_3, 2);

								Divider(node_4, {});

								var node_5 = $.sibling(node_4, 2);

								$.component(node_5, () => Layout.Stack, ($$anchor, Layout_Stack) => {
									Layout_Stack($$anchor, {
										gap: 'xs',
										children: ($$anchor, $$slotProps) => {
											var fragment_8 = root_2();
											var node_6 = $.first_child(fragment_8);

											$.component(node_6, () => Typography.Text, ($$anchor, Typography_Text) => {
												Typography_Text($$anchor, {
													variant: 'm-500',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Confidential clients');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											});

											var node_7 = $.sibling(node_6, 2);

											$.component(node_7, () => Typography.Caption, ($$anchor, Typography_Caption) => {
												Typography_Caption($$anchor, {
													variant: '400',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text('Server-side apps that authenticate with a client secret.');

														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});
								});

								var div = $.sibling(node_5, 2);
								var node_8 = $.child(div);

								{
									let $0 = $.derived(() => !$canWriteProjects());

									InputNumber(node_8, {
										id: 'oauth2-access-token-duration',
										label: 'Access token duration',
										placeholder: '8',
										min: 1,
										get disabled() {
											return $.get($0);
										},

										get value() {
											return $.get(accessTokenValue);
										},

										set value($$value) {
											$.set(accessTokenValue, $$value, true);
										}
									});
								}

								var node_9 = $.sibling(node_8, 2);

								{
									let $0 = $.derived(() => !$canWriteProjects());

									InputSelect(node_9, {
										id: 'oauth2-access-token-unit',
										required: true,
										get options() {
											return unitOptions;
										},

										get disabled() {
											return $.get($0);
										},

										get value() {
											return $.get(accessTokenUnit);
										},

										set value($$value) {
											$.set(accessTokenUnit, $$value, true);
										}
									});
								}

								$.reset(div);

								var div_1 = $.sibling(div, 2);
								var node_10 = $.child(div_1);

								{
									let $0 = $.derived(() => !$canWriteProjects());

									InputNumber(node_10, {
										id: 'oauth2-refresh-token-duration',
										label: 'Refresh token duration',
										placeholder: '365',
										min: 1,
										get disabled() {
											return $.get($0);
										},

										get value() {
											return $.get(refreshTokenValue);
										},

										set value($$value) {
											$.set(refreshTokenValue, $$value, true);
										}
									});
								}

								var node_11 = $.sibling(node_10, 2);

								{
									let $0 = $.derived(() => !$canWriteProjects());

									InputSelect(node_11, {
										id: 'oauth2-refresh-token-unit',
										required: true,
										get options() {
											return unitOptions;
										},

										get disabled() {
											return $.get($0);
										},

										get value() {
											return $.get(refreshTokenUnit);
										},

										set value($$value) {
											$.set(refreshTokenUnit, $$value, true);
										}
									});
								}

								$.reset(div_1);

								var node_12 = $.sibling(div_1, 2);

								{
									let $0 = $.derived(() => !$canWriteProjects());

									$.component(node_12, () => Selector.Switch, ($$anchor, Selector_Switch_1) => {
										Selector_Switch_1($$anchor, {
											id: 'oauth2-confidential-pkce',
											label: 'Require PKCE',
											description: 'When enabled, confidential clients must use PKCE in addition to their client secret. Public clients always require PKCE.',
											get disabled() {
												return $.get($0);
											},

											get checked() {
												return $.get(confidentialPkce);
											},

											set checked($$value) {
												$.set(confidentialPkce, $$value, true);
											}
										});
									});
								}

								var node_13 = $.sibling(node_12, 2);

								Divider(node_13, {});

								var node_14 = $.sibling(node_13, 2);

								$.component(node_14, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
									Layout_Stack_1($$anchor, {
										gap: 'xs',
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = root_2();
											var node_15 = $.first_child(fragment_9);

											$.component(node_15, () => Typography.Text, ($$anchor, Typography_Text_1) => {
												Typography_Text_1($$anchor, {
													variant: 'm-500',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text('Public clients');

														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												});
											});

											var node_16 = $.sibling(node_15, 2);

											$.component(node_16, () => Typography.Caption, ($$anchor, Typography_Caption_1) => {
												Typography_Caption_1($$anchor, {
													variant: '400',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_5 = $.text('SPAs, mobile, and native apps that cannot keep a client secret.');

														$.append($$anchor, text_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});
								});

								var div_2 = $.sibling(node_14, 2);
								var node_17 = $.child(div_2);

								{
									let $0 = $.derived(() => !$canWriteProjects());

									InputNumber(node_17, {
										id: 'oauth2-public-access-token-duration',
										label: 'Access token duration',
										placeholder: '1',
										min: 1,
										get disabled() {
											return $.get($0);
										},

										get value() {
											return $.get(publicAccessTokenValue);
										},

										set value($$value) {
											$.set(publicAccessTokenValue, $$value, true);
										}
									});
								}

								var node_18 = $.sibling(node_17, 2);

								{
									let $0 = $.derived(() => !$canWriteProjects());

									InputSelect(node_18, {
										id: 'oauth2-public-access-token-unit',
										required: true,
										get options() {
											return unitOptions;
										},

										get disabled() {
											return $.get($0);
										},

										get value() {
											return $.get(publicAccessTokenUnit);
										},

										set value($$value) {
											$.set(publicAccessTokenUnit, $$value, true);
										}
									});
								}

								$.reset(div_2);

								var div_3 = $.sibling(div_2, 2);
								var node_19 = $.child(div_3);

								{
									let $0 = $.derived(() => !$canWriteProjects());

									InputNumber(node_19, {
										id: 'oauth2-public-refresh-token-duration',
										label: 'Refresh token duration',
										placeholder: '30',
										min: 1,
										get disabled() {
											return $.get($0);
										},

										get value() {
											return $.get(publicRefreshTokenValue);
										},

										set value($$value) {
											$.set(publicRefreshTokenValue, $$value, true);
										}
									});
								}

								var node_20 = $.sibling(node_19, 2);

								{
									let $0 = $.derived(() => !$canWriteProjects());

									InputSelect(node_20, {
										id: 'oauth2-public-refresh-token-unit',
										required: true,
										get options() {
											return unitOptions;
										},

										get disabled() {
											return $.get($0);
										},

										get value() {
											return $.get(publicRefreshTokenUnit);
										},

										set value($$value) {
											$.set(publicRefreshTokenUnit, $$value, true);
										}
									});
								}

								$.reset(div_3);
								$.append($$anchor, fragment_3);
							};

							$.if(node_1, ($$render) => {
								if ($.get(enabled)) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_2);
					},

					actions: ($$anchor, $$slotProps) => {
						Button($$anchor, {
							submit: true,
							get disabled() {
								return $.get(isButtonDisabled);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Update');

								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}