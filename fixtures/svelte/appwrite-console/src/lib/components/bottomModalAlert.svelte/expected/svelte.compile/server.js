import * as $ from 'svelte/internal/server';
import { Button } from '$lib/elements/forms/index';
import { hideNotification, shouldShowNotification } from '$lib/helpers/notifications';
import { app } from '$lib/stores/app';

import {
	bottomModalAlertsConfig,
	dismissBottomModalAlert,
	hideAllModalAlerts
} from '$lib/stores/bottom-alerts';

import { onMount } from 'svelte';
import { organization } from '$lib/stores/organization';
import { canUpgrade, getChangePlanUrl } from '$lib/stores/billing';
import { addBottomModalAlerts } from '$routes/(console)/bottomAlerts';
import { project } from '$routes/(console)/project-[region]-[project]/store';
import { page } from '$app/state';
import { Click, trackEvent } from '$lib/actions/analytics';
import { goto } from '$app/navigation';
import { Typography } from '@appwrite.io/pink-svelte';

export default function BottomModalAlert($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		function resolveThemeColor(color) {
			if (!color) return undefined;
			if (typeof color === 'string') return color;

			return color[$.store_get($$store_subs ??= {}, '$app', app).themeInUse];
		}

		let currentIndex = 0;
		let openModalOnMobile = false;

		function getPageScope(route) {
			const isProjectPage = route.includes('project-[region]-[project]');
			const isOrganizationPage = route.includes('organization-[organization]');

			return { isProjectPage, isOrganizationPage };
		}

		function filterModalAlerts(alerts, route) {
			const { isProjectPage, isOrganizationPage } = getPageScope(route);

			return alerts.sort((a, b) => b.importance - a.importance).filter((alert) => {
				if (!alert.show || !shouldShowNotification(alert.id)) return false;

				switch (alert.scope) {
					case 'everywhere':
						return true;

					case 'project':
						return isProjectPage;

					case 'organization':
						return isOrganizationPage;

					default:
						return false;
				}
			});
		}

		const bottomModalAlerts = $.derived(() => $.store_get($$store_subs ??= {}, '$bottomModalAlertsConfig', bottomModalAlertsConfig).alerts);
		const filteredModalAlerts = $.derived(() => filterModalAlerts(bottomModalAlerts(), page.route.id));
		const currentModalAlert = $.derived(() => filteredModalAlerts()[currentIndex]);
		const hasOnlyPrimaryCta = $.derived(() => typeof currentModalAlert()?.learnMore === 'undefined');
		const isOnOnboarding = $.derived(() => page.route.id.includes('(console)/onboarding'));

		function handleClose(id = null) {
			const alerts = !id
				? filteredModalAlerts()
				: filteredModalAlerts().filter((alert) => alert.id === id);

			alerts.forEach((alert) => {
				const modalAlert = alert;

				dismissBottomModalAlert(modalAlert.id);
				hideNotification(modalAlert.id, { coolOffPeriod: 24 * 365 });

				if (modalAlert.closed) modalAlert.closed();
			});

			// reset `currentIndex` if we removed the last item
			if (currentIndex >= filteredModalAlerts().length - 1) {
				currentIndex = Math.max(0, filteredModalAlerts().length - 2);
			}
		}

		function showNext() {
			currentIndex = (currentIndex + 1) % filteredModalAlerts().length;
		}

		function showPrevious() {
			currentIndex = (currentIndex - 1 + filteredModalAlerts().length) % filteredModalAlerts().length;
		}

		function getMobileWindowConfig() {
			const config = $.store_get($$store_subs ??= {}, '$bottomModalAlertsConfig', bottomModalAlertsConfig)?.mobileSingleLayout;
			const visibleAlerts = $.store_get($$store_subs ??= {}, '$bottomModalAlertsConfig', bottomModalAlertsConfig).alerts.filter((a) => a.show);

			const fallback = {
				title: 'New features available',
				message: 'Explore new features to enhance your projects and improve security.'
			};

			// override
			if (currentModalAlert()?.sameContentOnMobileLayout) {
				fallback.title = currentModalAlert()?.title;
				fallback.message = currentModalAlert()?.message;
			}

			const shouldApplyConfig = config?.enabled === true && visibleAlerts.length === 1;

			return {
				cta: !!(shouldApplyConfig && config.cta),
				html: !!(shouldApplyConfig && config.isHtml),
				title: shouldApplyConfig && config.title ? config.title : fallback.title,
				message: shouldApplyConfig && config.message ? config.message : fallback.message
			};
		}

		function triggerMobileWindowLink() {
			handleClose();

			const url = $.store_get($$store_subs ??= {}, '$bottomModalAlertsConfig', bottomModalAlertsConfig).mobileSingleLayout.cta.link({
				organization: $.store_get($$store_subs ??= {}, '$organization', organization),
				project: $.store_get($$store_subs ??= {}, '$project', project)
			});

			if ($.store_get($$store_subs ??= {}, '$bottomModalAlertsConfig', bottomModalAlertsConfig).mobileSingleLayout.cta.external) {
				window.open(url, '_blank');
			} else {
				goto(url);
			}
		}

		// the button component cannot have both href and on:click!
		function triggerWindowLink(alert, event) {
			const alertAction = alert.cta;
			const shouldShowUpgrade = !alertAction.skipUpgradeRedirect && canUpgrade($.store_get($$store_subs ??= {}, '$organization', organization)?.billingPlanDetails);

			// for correct event tracking after removal
			const currentModalId = currentModalAlert().id;

			const organizationId = $.store_get($$store_subs ??= {}, '$project', project)?.teamId ?? $.store_get($$store_subs ??= {}, '$organization', organization)?.$id;

			const url = shouldShowUpgrade
				? getChangePlanUrl(organizationId)
				: alertAction.link({
					organization: $.store_get($$store_subs ??= {}, '$organization', organization),
					project: $.store_get($$store_subs ??= {}, '$project', project)
				});

			if (!shouldShowUpgrade && alertAction.external) {
				window.open(url, '_blank');
			} else {
				goto(url);
			}

			if (alertAction?.hideOnClick === true) {
				handleClose(alert.id); // gone!
			}

			trackEvent(Click.PromoClick, {
				promo: currentModalId,
				type: shouldShowUpgrade ? 'upgrade' : event ?? `cta_click_${currentModalId}`
			});
		}

		onMount(addBottomModalAlerts);

		if (!isOnOnboarding() && filteredModalAlerts().length > 0 && currentModalAlert()) {
			$$renderer.push('<!--[0-->');

			const shouldShowUpgrade = canUpgrade($.store_get($$store_subs ??= {}, '$organization', organization)?.billingPlanDetails);

			$$renderer.push(`<div class="main-alert-wrapper is-not-mobile svelte-16hzf6y"><div class="alert-container svelte-16hzf6y"><article class="card svelte-16hzf6y"><!---->`);

			{
				$$renderer.push(`<button aria-label="Close modal" class="icon-inline-tag svelte-16hzf6y"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.29289 4.29289C4.68342 3.90237 5.31658 3.90237 5.70711 4.29289L10 8.58579L14.2929 4.29289C14.6834 3.90237 15.3166 3.90237 15.7071 4.29289C16.0976 4.68342 16.0976 5.31658 15.7071 5.70711L11.4142 10L15.7071 14.2929C16.0976 14.6834 16.0976 15.3166 15.7071 15.7071C15.3166 16.0976 14.6834 16.0976 14.2929 15.7071L10 11.4142L5.70711 15.7071C5.31658 16.0976 4.68342 16.0976 4.29289 15.7071C3.90237 15.3166 3.90237 14.6834 4.29289 14.2929L8.58579 10L4.29289 5.70711C3.90237 5.31658 3.90237 4.68342 4.29289 4.29289Z" fill="#97979B"></path></svg></button> <div class="content-wrapper u-flex-vertical u-gap-16">`);

				if (currentModalAlert().backgroundComponent) {
					$$renderer.push('<!--[0-->');

					const BackgroundComponent = currentModalAlert().backgroundComponent;

					if (BackgroundComponent) {
						$$renderer.push('<!--[-->');
						BackgroundComponent($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else if ($.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark') {
					$$renderer.push(`<!--[1--><img${$.attr('src', currentModalAlert().src.dark)}${$.attr('alt', currentModalAlert().title)} class="showcase-image u-image-object-fit-contain u-block u-only-dark svelte-16hzf6y"/>`);
				} else {
					$$renderer.push(`<!--[-1--><img${$.attr('src', currentModalAlert().src.light)}${$.attr('alt', currentModalAlert().title)} class="showcase-image u-image-object-fit-contain u-block u-only-light svelte-16hzf6y"/>`);
				}

				$$renderer.push(`<!--]--> `);

				if (filteredModalAlerts().length > 1) {
					$$renderer.push(`<!--[0--><div class="u-flex u-main-space-between u-cross-baseline"><span class="inline-tag feature-count-tag svelte-16hzf6y">Feature ${$.escape(currentIndex + 1)} of ${$.escape(filteredModalAlerts().length)}</span> <div class="u-flex u-gap-10 svelte-16hzf6y"><button aria-label="Previous"${$.attr_class('icon-cheveron-left svelte-16hzf6y', void 0, { 'active': currentIndex > 0 })}${$.attr('disabled', currentIndex === 0, true)}${$.attr_style('', { cursor: currentIndex !== 0 ? 'pointer' : undefined })}></button> <button aria-label="Next"${$.attr_class('icon-cheveron-right svelte-16hzf6y', void 0, { 'active': currentIndex !== filteredModalAlerts().length - 1 })}${$.attr('disabled', currentIndex === filteredModalAlerts().length - 1, true)}${$.attr_style('', {
						cursor: currentIndex !== filteredModalAlerts().length - 1 ? 'pointer' : undefined
					})}></button></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="u-flex-vertical u-gap-4 u-padding-inline-8">`);

				if (Typography.Text) {
					$$renderer.push('<!--[-->');

					Typography.Text($$renderer, {
						variant: 'm-500',
						color: '--fgcolor-neutral-primary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(currentModalAlert().title)}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <span class="u-width-fit-content">`);

				if (currentModalAlert().isHtml) {
					$$renderer.push(`<!--[0-->${$.html(currentModalAlert().message)}`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(currentModalAlert().message)}`);
				}

				$$renderer.push(`<!--]--></span></div> <div class="buttons u-flex u-flex-vertical-mobile u-gap-4 u-padding-inline-8 u-padding-block-8">`);

				$.css_props(
					$$renderer,
					true,
					{
						'--bgcolor-accent': resolveThemeColor(currentModalAlert().cta.background),
						'--bgcolor-accent-secondary': resolveThemeColor(currentModalAlert().cta.backgroundHover)
					},
					() => {
						Button($$renderer, {
							size: 'xs',
							fullWidthMobile: true,
							secondary: !hasOnlyPrimaryCta(),
							class: `${hasOnlyPrimaryCta() ? 'only-primary-cta' : ''}`,
							children: ($$renderer) => {
								$$renderer.push(`<span${$.attr_style('', { color: resolveThemeColor(currentModalAlert().cta.color) })}>${$.escape(currentModalAlert().cta.text)}</span>`);
							},
							$$slots: { default: true }
						});
					}
				);

				$$renderer.push(` `);

				if (currentModalAlert().learnMore) {
					$$renderer.push('<!--[0-->');

					Button($$renderer, {
						text: true,
						size: 'xs',
						class: 'button',
						external: true,
						fullWidthMobile: true,
						href: currentModalAlert().learnMore.link({
							project: $.store_get($$store_subs ??= {}, '$project', project),
							organization: $.store_get($$store_subs ??= {}, '$organization', organization)
						}),

						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(currentModalAlert().learnMore.text)}`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div>`);
			}

			$$renderer.push(`<!----></article></div></div> <div${$.attr_class('main-alert-wrapper is-only-mobile svelte-16hzf6y', void 0, { 'closed': !openModalOnMobile })}>`);

			if (openModalOnMobile) {
				$$renderer.push(`<!--[0--><div class="alert-container svelte-16hzf6y"><article class="card svelte-16hzf6y"><!---->`);

				{
					$$renderer.push(`<button aria-label="Close modal" class="icon-inline-tag svelte-16hzf6y"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.29289 4.29289C4.68342 3.90237 5.31658 3.90237 5.70711 4.29289L10 8.58579L14.2929 4.29289C14.6834 3.90237 15.3166 3.90237 15.7071 4.29289C16.0976 4.68342 16.0976 5.31658 15.7071 5.70711L11.4142 10L15.7071 14.2929C16.0976 14.6834 16.0976 15.3166 15.7071 15.7071C15.3166 16.0976 14.6834 16.0976 14.2929 15.7071L10 11.4142L5.70711 15.7071C5.31658 16.0976 4.68342 16.0976 4.29289 15.7071C3.90237 15.3166 3.90237 14.6834 4.29289 14.2929L8.58579 10L4.29289 5.70711C3.90237 5.31658 3.90237 4.68342 4.29289 4.29289Z" fill="#97979B"></path></svg></button> <div class="content-wrapper u-flex-vertical u-gap-16">`);

					if (currentModalAlert().backgroundComponent) {
						$$renderer.push('<!--[0-->');

						const BackgroundComponent = currentModalAlert().backgroundComponent;

						if (BackgroundComponent) {
							$$renderer.push('<!--[-->');
							BackgroundComponent($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else if ($.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark') {
						$$renderer.push(`<!--[1--><img${$.attr('src', currentModalAlert().src.dark)}${$.attr('alt', currentModalAlert().title)} class="showcase-image u-image-object-fit-contain u-block u-only-dark svelte-16hzf6y"/>`);
					} else {
						$$renderer.push(`<!--[-1--><img${$.attr('src', currentModalAlert().src.light)}${$.attr('alt', currentModalAlert().title)} class="showcase-image u-image-object-fit-contain u-block u-only-light svelte-16hzf6y"/>`);
					}

					$$renderer.push(`<!--]--> `);

					if (filteredModalAlerts().length > 1) {
						$$renderer.push(`<!--[0--><div class="u-flex u-main-space-between u-cross-baseline"><span class="inline-tag feature-count-tag svelte-16hzf6y">Feature ${$.escape(currentIndex + 1)} of ${$.escape(filteredModalAlerts().length)}</span> <div class="u-flex u-gap-10 svelte-16hzf6y"><button aria-label="Previous"${$.attr_class('icon-cheveron-left svelte-16hzf6y', void 0, { 'active': currentIndex > 0 })}${$.attr('disabled', currentIndex === 0, true)}${$.attr_style('', { cursor: currentIndex !== 0 ? 'pointer' : undefined })}></button> <button aria-label="Next"${$.attr_class('icon-cheveron-right svelte-16hzf6y', void 0, { 'active': currentIndex !== filteredModalAlerts().length - 1 })}${$.attr('disabled', currentIndex === filteredModalAlerts().length - 1, true)}${$.attr_style('', {
							cursor: currentIndex !== filteredModalAlerts().length - 1 ? 'pointer' : undefined
						})}></button></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div class="u-flex-vertical u-gap-4 u-padding-inline-8">`);

					if (Typography.Text) {
						$$renderer.push('<!--[-->');

						Typography.Text($$renderer, {
							variant: 'm-500',
							color: '--fgcolor-neutral-primary',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(currentModalAlert().title)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` <span class="u-width-fit-content">`);

					if (currentModalAlert().isHtml) {
						$$renderer.push(`<!--[0-->${$.html(currentModalAlert().message)}`);
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(currentModalAlert().message)}`);
					}

					$$renderer.push(`<!--]--></span></div> <div class="buttons u-flex u-flex-vertical-mobile u-gap-4 u-padding-inline-8 u-padding-block-8">`);

					$.css_props(
						$$renderer,
						true,
						{
							'--bgcolor-accent': resolveThemeColor(currentModalAlert().cta.background),
							'--bgcolor-accent-secondary': resolveThemeColor(currentModalAlert().cta.backgroundHover)
						},
						() => {
							Button($$renderer, {
								size: 'xs',
								secondary: !hasOnlyPrimaryCta(),
								class: 'button',
								fullWidthMobile: true,
								children: ($$renderer) => {
									$$renderer.push(`<span${$.attr_style('', { color: resolveThemeColor(currentModalAlert().cta.color) })}>${$.escape(shouldShowUpgrade ? 'Upgrade plan' : currentModalAlert().cta.text)}</span>`);
								},
								$$slots: { default: true }
							});
						}
					);

					$$renderer.push(` `);

					if (currentModalAlert().learnMore) {
						$$renderer.push('<!--[0-->');

						Button($$renderer, {
							text: true,
							size: 'xs',
							class: 'button',
							external: true,
							fullWidthMobile: true,
							href: currentModalAlert().learnMore.link({
								project: $.store_get($$store_subs ??= {}, '$project', project),
								organization: $.store_get($$store_subs ??= {}, '$organization', organization)
							}),

							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(currentModalAlert().learnMore.text)}`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
				}

				$$renderer.push(`<!----></article></div>`);
			} else {
				$$renderer.push('<!--[-1-->');

				const mobileConfig = getMobileWindowConfig();

				$$renderer.push(`<div tabindex="0" role="button"${$.attr_class('card notification-card u-width-full-line svelte-16hzf6y', void 0, { 'showing': !openModalOnMobile })}><div class="u-flex-vertical u-gap-4"><div class="u-flex u-cross-center u-main-space-between">`);

				if (Typography.Text) {
					$$renderer.push('<!--[-->');

					Typography.Text($$renderer, {
						variant: 'm-500',
						color: '--fgcolor-neutral-primary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(mobileConfig.title)}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <button aria-label="Close"><span class="icon-x"></span></button></div> <span class="u-width-fit-content">`);

				if (mobileConfig.html) {
					$$renderer.push(`<!--[0-->${$.html(mobileConfig.message)}`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(mobileConfig.message)}`);
				}

				$$renderer.push(`<!--]--></span></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}