import * as $ from 'svelte/internal/server';
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

export default function UpdateOAuth2Server($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
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

		let enabled = false;
		let authorizationUrl = '';
		let scopes = [];
		let accessTokenValue = null;
		let accessTokenUnit = 'hours';
		let refreshTokenValue = null;
		let refreshTokenUnit = 'days';
		let publicAccessTokenValue = null;
		let publicAccessTokenUnit = 'hours';
		let publicRefreshTokenValue = null;
		let publicRefreshTokenUnit = 'days';
		let confidentialPkce = false;
		const accessTokenDuration = $.derived(() => toSeconds(accessTokenValue, accessTokenUnit));
		const refreshTokenDuration = $.derived(() => toSeconds(refreshTokenValue, refreshTokenUnit));
		const publicAccessTokenDuration = $.derived(() => toSeconds(publicAccessTokenValue, publicAccessTokenUnit));
		const publicRefreshTokenDuration = $.derived(() => toSeconds(publicRefreshTokenValue, publicRefreshTokenUnit));

		const isButtonDisabled = $.derived(() => !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects) || deepEqual(
			{
				enabled,
				authorizationUrl,
				scopes,
				accessTokenDuration: accessTokenDuration(),
				refreshTokenDuration: refreshTokenDuration(),
				publicAccessTokenDuration: publicAccessTokenDuration(),
				publicRefreshTokenDuration: publicRefreshTokenDuration(),
				confidentialPkce
			},
			{
				enabled: $.store_get($$store_subs ??= {}, '$project', project).oAuth2ServerEnabled ?? false,
				authorizationUrl: $.store_get($$store_subs ??= {}, '$project', project).oAuth2ServerAuthorizationUrl ?? '',
				scopes: $.store_get($$store_subs ??= {}, '$project', project).oAuth2ServerScopes ?? [],
				accessTokenDuration: $.store_get($$store_subs ??= {}, '$project', project).oAuth2ServerAccessTokenDuration ?? null,
				refreshTokenDuration: $.store_get($$store_subs ??= {}, '$project', project).oAuth2ServerRefreshTokenDuration ?? null,
				publicAccessTokenDuration: $.store_get($$store_subs ??= {}, '$project', project).oAuth2ServerPublicAccessTokenDuration ?? null,
				publicRefreshTokenDuration: $.store_get($$store_subs ??= {}, '$project', project).oAuth2ServerPublicRefreshTokenDuration ?? null,
				confidentialPkce: $.store_get($$store_subs ??= {}, '$project', project).oAuth2ServerConfidentialPkce ?? false
			}
		));

		async function update() {
			try {
				await sdk.forProject($.store_get($$store_subs ??= {}, '$project', project).region, $.store_get($$store_subs ??= {}, '$project', project).$id).project.updateOAuth2Server({
					enabled,
					authorizationUrl,
					scopes,
					accessTokenDuration: accessTokenDuration() ?? undefined,
					refreshTokenDuration: refreshTokenDuration() ?? undefined,
					publicAccessTokenDuration: publicAccessTokenDuration() ?? undefined,
					publicRefreshTokenDuration: publicRefreshTokenDuration() ?? undefined,
					confidentialPkce
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: update,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Configure your project as an OAuth2 authorization server. When enabled, external applications
        can authenticate users through your project using the OAuth2 protocol.`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`OAuth2 server`);
								}
							},

							aside: ($$renderer) => {
								{
									if (Selector.Switch) {
										$$renderer.push('<!--[-->');

										Selector.Switch($$renderer, {
											id: 'oauth2-server-enabled',
											label: 'Enable OAuth2 server',
											description: 'Allow external applications to authenticate users through your project.',
											disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
											get checked() {
												return enabled;
											},

											set checked($$value) {
												enabled = $$value;
												$$settled = false;
											}
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (enabled) {
										$$renderer.push('<!--[0-->');

										InputText($$renderer, {
											id: 'oauth2-authorization-url',
											label: 'Authorization URL',
											required: true,
											placeholder: 'https://example.com/consent',
											disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
											get value() {
												return authorizationUrl;
											},

											set value($$value) {
												authorizationUrl = $$value;
												$$settled = false;
											},

											$$slots: {
												info: ($$renderer) => {
													Tooltip($$renderer, {
														slot: 'info',
														children: ($$renderer) => {
															Icon($$renderer, { icon: IconInfo, size: 's' });
														},

														$$slots: {
															default: true,
															tooltip: ($$renderer) => {
																$$renderer.push(`<span slot="tooltip">The consent screen URL shown to users during the OAuth2 authorization
                            flow.</span>`);
															}
														}
													});
												}
											}
										});

										$$renderer.push(`<!----> `);

										InputTags($$renderer, {
											id: 'oauth2-scopes',
											label: 'Scopes',
											placeholder: 'e.g. profile',
											max: 100,
											disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
											get tags() {
												return scopes;
											},

											set tags($$value) {
												scopes = $$value;
												$$settled = false;
											},

											$$slots: {
												info: ($$renderer) => {
													Tooltip($$renderer, {
														slot: 'info',
														children: ($$renderer) => {
															Icon($$renderer, { icon: IconInfo, size: 's' });
														},

														$$slots: {
															default: true,
															tooltip: ($$renderer) => {
																$$renderer.push(`<span slot="tooltip">OAuth2 scopes this server will accept. Up to 100 scopes, each up to 128
                            characters long.</span>`);
															}
														}
													});
												}
											}
										});

										$$renderer.push(`<!----> `);
										Divider($$renderer, {});
										$$renderer.push(`<!----> `);

										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												gap: 'xs',
												children: ($$renderer) => {
													if (Typography.Text) {
														$$renderer.push('<!--[-->');

														Typography.Text($$renderer, {
															variant: 'm-500',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Confidential clients`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Typography.Caption) {
														$$renderer.push('<!--[-->');

														Typography.Caption($$renderer, {
															variant: '400',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Server-side apps that authenticate with a client secret.`);
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

										$$renderer.push(` <div class="duration-field svelte-4wcrp9">`);

										InputNumber($$renderer, {
											id: 'oauth2-access-token-duration',
											label: 'Access token duration',
											placeholder: '8',
											min: 1,
											disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
											get value() {
												return accessTokenValue;
											},

											set value($$value) {
												accessTokenValue = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> `);

										InputSelect($$renderer, {
											id: 'oauth2-access-token-unit',
											required: true,
											options: unitOptions,
											disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
											get value() {
												return accessTokenUnit;
											},

											set value($$value) {
												accessTokenUnit = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> <div class="duration-field svelte-4wcrp9">`);

										InputNumber($$renderer, {
											id: 'oauth2-refresh-token-duration',
											label: 'Refresh token duration',
											placeholder: '365',
											min: 1,
											disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
											get value() {
												return refreshTokenValue;
											},

											set value($$value) {
												refreshTokenValue = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> `);

										InputSelect($$renderer, {
											id: 'oauth2-refresh-token-unit',
											required: true,
											options: unitOptions,
											disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
											get value() {
												return refreshTokenUnit;
											},

											set value($$value) {
												refreshTokenUnit = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> `);

										if (Selector.Switch) {
											$$renderer.push('<!--[-->');

											Selector.Switch($$renderer, {
												id: 'oauth2-confidential-pkce',
												label: 'Require PKCE',
												description: 'When enabled, confidential clients must use PKCE in addition to their client secret. Public clients always require PKCE.',
												disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
												get checked() {
													return confidentialPkce;
												},

												set checked($$value) {
													confidentialPkce = $$value;
													$$settled = false;
												}
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);
										Divider($$renderer, {});
										$$renderer.push(`<!----> `);

										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												gap: 'xs',
												children: ($$renderer) => {
													if (Typography.Text) {
														$$renderer.push('<!--[-->');

														Typography.Text($$renderer, {
															variant: 'm-500',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Public clients`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Typography.Caption) {
														$$renderer.push('<!--[-->');

														Typography.Caption($$renderer, {
															variant: '400',
															children: ($$renderer) => {
																$$renderer.push(`<!---->SPAs, mobile, and native apps that cannot keep a client secret.`);
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

										$$renderer.push(` <div class="duration-field svelte-4wcrp9">`);

										InputNumber($$renderer, {
											id: 'oauth2-public-access-token-duration',
											label: 'Access token duration',
											placeholder: '1',
											min: 1,
											disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
											get value() {
												return publicAccessTokenValue;
											},

											set value($$value) {
												publicAccessTokenValue = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> `);

										InputSelect($$renderer, {
											id: 'oauth2-public-access-token-unit',
											required: true,
											options: unitOptions,
											disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
											get value() {
												return publicAccessTokenUnit;
											},

											set value($$value) {
												publicAccessTokenUnit = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> <div class="duration-field svelte-4wcrp9">`);

										InputNumber($$renderer, {
											id: 'oauth2-public-refresh-token-duration',
											label: 'Refresh token duration',
											placeholder: '30',
											min: 1,
											disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
											get value() {
												return publicRefreshTokenValue;
											},

											set value($$value) {
												publicRefreshTokenValue = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> `);

										InputSelect($$renderer, {
											id: 'oauth2-public-refresh-token-unit',
											required: true,
											options: unitOptions,
											disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
											get value() {
												return publicRefreshTokenUnit;
											},

											set value($$value) {
												publicRefreshTokenUnit = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										submit: true,
										disabled: isButtonDisabled(),
										children: ($$renderer) => {
											$$renderer.push(`<!---->Update`);
										},
										$$slots: { default: true }
									});
								}
							}
						}
					});
				},
				$$slots: { default: true }
			});
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