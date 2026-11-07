import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<img class="showcase-image u-image-object-fit-contain u-block u-only-dark svelte-16hzf6y"/>`);
var root_1 = $.from_html(`<img class="showcase-image u-image-object-fit-contain u-block u-only-light svelte-16hzf6y"/>`);
var root_2 = $.from_html(`<div class="u-flex u-main-space-between u-cross-baseline"><span class="inline-tag feature-count-tag svelte-16hzf6y"> </span> <div class="u-flex u-gap-10 svelte-16hzf6y"><button aria-label="Previous"></button> <button aria-label="Next"></button></div></div>`);
var root_3 = $.from_html(`<span> </span>`);
var root_4 = $.from_html(`<button aria-label="Close modal" class="icon-inline-tag svelte-16hzf6y"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.29289 4.29289C4.68342 3.90237 5.31658 3.90237 5.70711 4.29289L10 8.58579L14.2929 4.29289C14.6834 3.90237 15.3166 3.90237 15.7071 4.29289C16.0976 4.68342 16.0976 5.31658 15.7071 5.70711L11.4142 10L15.7071 14.2929C16.0976 14.6834 16.0976 15.3166 15.7071 15.7071C15.3166 16.0976 14.6834 16.0976 14.2929 15.7071L10 11.4142L5.70711 15.7071C5.31658 16.0976 4.68342 16.0976 4.29289 15.7071C3.90237 15.3166 3.90237 14.6834 4.29289 14.2929L8.58579 10L4.29289 5.70711C3.90237 5.31658 3.90237 4.68342 4.29289 4.29289Z" fill="#97979B"></path></svg></button> <div class="content-wrapper u-flex-vertical u-gap-16"><!> <!> <div class="u-flex-vertical u-gap-4 u-padding-inline-8"><!> <span class="u-width-fit-content"><!></span></div> <div class="buttons u-flex u-flex-vertical-mobile u-gap-4 u-padding-inline-8 u-padding-block-8"><svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper> <!></div></div>`, 1);
var root_5 = $.from_html(`<div class="alert-container svelte-16hzf6y"><article class="card svelte-16hzf6y"><!></article></div>`);
var root_6 = $.from_html(`<div tabindex="0" role="button"><div class="u-flex-vertical u-gap-4"><div class="u-flex u-cross-center u-main-space-between"><!> <button aria-label="Close"><span class="icon-x"></span></button></div> <span class="u-width-fit-content"><!></span></div></div>`);
var root_7 = $.from_html(`<div class="main-alert-wrapper is-not-mobile svelte-16hzf6y"><div class="alert-container svelte-16hzf6y"><article class="card svelte-16hzf6y"><!></article></div></div> <div><!></div>`, 1);

export default function BottomModalAlert($$anchor, $$props) {
	$.push($$props, true);

	const $app = () => $.store_get(app, '$app', $$stores);
	const $bottomModalAlertsConfig = () => $.store_get(bottomModalAlertsConfig, '$bottomModalAlertsConfig', $$stores);
	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const $project = () => $.store_get(project, '$project', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function resolveThemeColor(color) {
		if (!color) return undefined;
		if (typeof color === 'string') return color;

		return color[$app().themeInUse];
	}

	let currentIndex = $.state(0);
	let openModalOnMobile = $.state(false);

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

	const bottomModalAlerts = $.derived(() => $bottomModalAlertsConfig().alerts);
	const filteredModalAlerts = $.derived(() => filterModalAlerts($.get(bottomModalAlerts), page.route.id));
	const currentModalAlert = $.derived(() => $.get(filteredModalAlerts)[$.get(currentIndex)]);
	const hasOnlyPrimaryCta = $.derived(() => typeof $.get(currentModalAlert)?.learnMore === 'undefined');
	const isOnOnboarding = $.derived(() => page.route.id.includes('(console)/onboarding'));

	function handleClose(id = null) {
		const alerts = !id
			? $.get(filteredModalAlerts)
			: $.get(filteredModalAlerts).filter((alert) => alert.id === id);

		alerts.forEach((alert) => {
			const modalAlert = alert;

			dismissBottomModalAlert(modalAlert.id);
			hideNotification(modalAlert.id, { coolOffPeriod: 24 * 365 });

			if (modalAlert.closed) modalAlert.closed();
		});

		// reset `currentIndex` if we removed the last item
		if ($.get(currentIndex) >= $.get(filteredModalAlerts).length - 1) {
			$.set(currentIndex, Math.max(0, $.get(filteredModalAlerts).length - 2), true);
		}
	}

	function showNext() {
		$.set(currentIndex, ($.get(currentIndex) + 1) % $.get(filteredModalAlerts).length);
	}

	function showPrevious() {
		$.set(currentIndex, ($.get(currentIndex) - 1 + $.get(filteredModalAlerts).length) % $.get(filteredModalAlerts).length);
	}

	function getMobileWindowConfig() {
		const config = $bottomModalAlertsConfig()?.mobileSingleLayout;
		const visibleAlerts = $bottomModalAlertsConfig().alerts.filter((a) => a.show);

		const fallback = {
			title: 'New features available',
			message: 'Explore new features to enhance your projects and improve security.'
		};

		// override
		if ($.get(currentModalAlert)?.sameContentOnMobileLayout) {
			fallback.title = $.get(currentModalAlert)?.title;
			fallback.message = $.get(currentModalAlert)?.message;
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

		const url = $bottomModalAlertsConfig().mobileSingleLayout.cta.link({ organization: $organization(), project: $project() });

		if ($bottomModalAlertsConfig().mobileSingleLayout.cta.external) {
			window.open(url, '_blank');
		} else {
			goto(url);
		}
	}

	// the button component cannot have both href and on:click!
	function triggerWindowLink(alert, event) {
		const alertAction = alert.cta;
		const shouldShowUpgrade = !alertAction.skipUpgradeRedirect && canUpgrade($organization()?.billingPlanDetails);

		// for correct event tracking after removal
		const currentModalId = $.get(currentModalAlert).id;

		const organizationId = $project()?.teamId ?? $organization()?.$id;

		const url = shouldShowUpgrade
			? getChangePlanUrl(organizationId)
			: alertAction.link({ organization: $organization(), project: $project() });

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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_12 = ($$anchor) => {
			const shouldShowUpgrade = $.derived(() => canUpgrade($organization()?.billingPlanDetails));
			var fragment_1 = root_7();
			var div = $.first_child(fragment_1);
			var div_1 = $.child(div);
			var article = $.child(div_1);
			var node_1 = $.child(article);

			$.key(node_1, () => $.get(currentModalAlert).id, ($$anchor) => {
				var fragment_2 = root_4();
				var button = $.first_child(fragment_2);
				var div_2 = $.sibling(button, 2);
				var node_2 = $.child(div_2);

				{
					var consequent = ($$anchor) => {
						const BackgroundComponent = $.derived(() => $.get(currentModalAlert).backgroundComponent);
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.component(node_3, () => $.get(BackgroundComponent), ($$anchor, BackgroundComponent_1) => {
							BackgroundComponent_1($$anchor, {});
						});

						$.append($$anchor, fragment_3);
					};

					var consequent_1 = ($$anchor) => {
						var img = root();

						$.template_effect(() => {
							$.set_attribute(img, 'src', $.get(currentModalAlert).src.dark);
							$.set_attribute(img, 'alt', $.get(currentModalAlert).title);
						});

						$.append($$anchor, img);
					};

					var alternate = ($$anchor) => {
						var img_1 = root_1();

						$.template_effect(() => {
							$.set_attribute(img_1, 'src', $.get(currentModalAlert).src.light);
							$.set_attribute(img_1, 'alt', $.get(currentModalAlert).title);
						});

						$.append($$anchor, img_1);
					};

					$.if(node_2, ($$render) => {
						if ($.get(currentModalAlert).backgroundComponent) $$render(consequent); else if ($app().themeInUse === 'dark') $$render(consequent_1, 1); else $$render(alternate, -1);
					});
				}

				var node_4 = $.sibling(node_2, 2);

				{
					var consequent_2 = ($$anchor) => {
						var div_3 = root_2();
						var span = $.child(div_3);
						var text = $.only_child(span);
						var div_4 = $.sibling(span, 2);
						var button_1 = $.child(div_4);
						let classes;
						let styles;
						var button_2 = $.sibling(button_1, 2);
						let classes_1;
						let styles_1;

						$.reset(div_4);
						$.reset(div_3);

						$.template_effect(() => {
							$.set_text(text, `Feature ${$.get(currentIndex) + 1} of ${$.get(filteredModalAlerts).length ?? ''}`);
							classes = $.set_class(button_1, 1, 'icon-cheveron-left svelte-16hzf6y', null, classes, { active: $.get(currentIndex) > 0 });
							button_1.disabled = $.get(currentIndex) === 0;
							styles = $.set_style(button_1, '', styles, { cursor: $.get(currentIndex) !== 0 ? 'pointer' : undefined });

							classes_1 = $.set_class(button_2, 1, 'icon-cheveron-right svelte-16hzf6y', null, classes_1, {
								active: $.get(currentIndex) !== $.get(filteredModalAlerts).length - 1
							});

							button_2.disabled = $.get(currentIndex) === $.get(filteredModalAlerts).length - 1;

							styles_1 = $.set_style(button_2, '', styles_1, {
								cursor: $.get(currentIndex) !== $.get(filteredModalAlerts).length - 1 ? 'pointer' : undefined
							});
						});

						$.delegated('click', button_1, showPrevious);
						$.delegated('click', button_2, showNext);
						$.append($$anchor, div_3);
					};

					$.if(node_4, ($$render) => {
						if ($.get(filteredModalAlerts).length > 1) $$render(consequent_2);
					});
				}

				var div_5 = $.sibling(node_4, 2);
				var node_5 = $.child(div_5);

				$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text) => {
					Typography_Text($$anchor, {
						variant: 'm-500',
						color: '--fgcolor-neutral-primary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, $.get(currentModalAlert).title));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var span_1 = $.sibling(node_5, 2);
				var node_6 = $.child(span_1);

				{
					var consequent_3 = ($$anchor) => {
						var fragment_5 = $.comment();
						var node_7 = $.first_child(fragment_5);

						$.html(node_7, () => $.get(currentModalAlert).message);
						$.append($$anchor, fragment_5);
					};

					var alternate_1 = ($$anchor) => {
						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, $.get(currentModalAlert).message));
						$.append($$anchor, text_2);
					};

					$.if(node_6, ($$render) => {
						if ($.get(currentModalAlert).isHtml) $$render(consequent_3); else $$render(alternate_1, -1);
					});
				}

				$.reset(span_1);
				$.reset(div_5);

				var div_6 = $.sibling(div_5, 2);
				var node_8 = $.child(div_6);

				{
					let $0 = $.derived(() => !$.get(hasOnlyPrimaryCta));
					let $1 = $.derived(() => `${$.get(hasOnlyPrimaryCta) ? 'only-primary-cta' : ''}`);
					let $2 = $.derived(() => resolveThemeColor($.get(currentModalAlert).cta.background));
					let $3 = $.derived(() => resolveThemeColor($.get(currentModalAlert).cta.backgroundHover));

					$.css_props(node_8, () => ({
						'--bgcolor-accent': $.get($2),
						'--bgcolor-accent-secondary': $.get($3)
					}));

					Button(node_8.lastChild, {
						size: 'xs',
						fullWidthMobile: true,
						get secondary() {
							return $.get($0);
						},

						get class() {
							return $.get($1);
						},
						$$events: { click: () => triggerWindowLink($.get(currentModalAlert)) },
						children: ($$anchor, $$slotProps) => {
							var span_2 = root_3();
							let styles_2;
							var text_3 = $.only_child(span_2, true);

							$.template_effect(
								($0) => {
									styles_2 = $.set_style(span_2, '', styles_2, { color: $0 });
									$.set_text(text_3, $.get(currentModalAlert).cta.text);
								},
								[() => resolveThemeColor($.get(currentModalAlert).cta.color)]
							);

							$.append($$anchor, span_2);
						},
						$$slots: { default: true }
					});

					$.reset(node_8);
				}

				var node_9 = $.sibling(node_8, 2);

				{
					var consequent_4 = ($$anchor) => {
						{
							let $0 = $.derived(() => $.get(currentModalAlert).learnMore.link({ project: $project(), organization: $organization() }));

							Button($$anchor, {
								text: true,
								size: 'xs',
								class: 'button',
								external: true,
								fullWidthMobile: true,
								get href() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text();

									$.template_effect(() => $.set_text(text_4, $.get(currentModalAlert).learnMore.text));
									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						}
					};

					$.if(node_9, ($$render) => {
						if ($.get(currentModalAlert).learnMore) $$render(consequent_4);
					});
				}

				$.reset(div_6);
				$.reset(div_2);
				$.delegated('click', button, () => handleClose());
				$.append($$anchor, fragment_2);
			});

			$.reset(article);
			$.reset(div_1);
			$.reset(div);

			var div_7 = $.sibling(div, 2);
			let classes_2;
			var node_10 = $.child(div_7);

			{
				var consequent_10 = ($$anchor) => {
					var div_8 = root_5();
					var article_1 = $.child(div_8);
					var node_11 = $.child(article_1);

					$.key(node_11, () => $.get(currentModalAlert).id, ($$anchor) => {
						var fragment_9 = root_4();
						var button_3 = $.first_child(fragment_9);
						var div_9 = $.sibling(button_3, 2);
						var node_12 = $.child(div_9);

						{
							var consequent_5 = ($$anchor) => {
								const BackgroundComponent = $.derived(() => $.get(currentModalAlert).backgroundComponent);
								var fragment_10 = $.comment();
								var node_13 = $.first_child(fragment_10);

								$.component(node_13, () => $.get(BackgroundComponent), ($$anchor, BackgroundComponent_2) => {
									BackgroundComponent_2($$anchor, {});
								});

								$.append($$anchor, fragment_10);
							};

							var consequent_6 = ($$anchor) => {
								var img_2 = root();

								$.template_effect(() => {
									$.set_attribute(img_2, 'src', $.get(currentModalAlert).src.dark);
									$.set_attribute(img_2, 'alt', $.get(currentModalAlert).title);
								});

								$.append($$anchor, img_2);
							};

							var alternate_2 = ($$anchor) => {
								var img_3 = root_1();

								$.template_effect(() => {
									$.set_attribute(img_3, 'src', $.get(currentModalAlert).src.light);
									$.set_attribute(img_3, 'alt', $.get(currentModalAlert).title);
								});

								$.append($$anchor, img_3);
							};

							$.if(node_12, ($$render) => {
								if ($.get(currentModalAlert).backgroundComponent) $$render(consequent_5); else if ($app().themeInUse === 'dark') $$render(consequent_6, 1); else $$render(alternate_2, -1);
							});
						}

						var node_14 = $.sibling(node_12, 2);

						{
							var consequent_7 = ($$anchor) => {
								var div_10 = root_2();
								var span_3 = $.child(div_10);
								var text_5 = $.only_child(span_3);
								var div_11 = $.sibling(span_3, 2);
								var button_4 = $.child(div_11);
								let classes_3;
								let styles_3;
								var button_5 = $.sibling(button_4, 2);
								let classes_4;
								let styles_4;

								$.reset(div_11);
								$.reset(div_10);

								$.template_effect(() => {
									$.set_text(text_5, `Feature ${$.get(currentIndex) + 1} of ${$.get(filteredModalAlerts).length ?? ''}`);
									classes_3 = $.set_class(button_4, 1, 'icon-cheveron-left svelte-16hzf6y', null, classes_3, { active: $.get(currentIndex) > 0 });
									button_4.disabled = $.get(currentIndex) === 0;
									styles_3 = $.set_style(button_4, '', styles_3, { cursor: $.get(currentIndex) !== 0 ? 'pointer' : undefined });

									classes_4 = $.set_class(button_5, 1, 'icon-cheveron-right svelte-16hzf6y', null, classes_4, {
										active: $.get(currentIndex) !== $.get(filteredModalAlerts).length - 1
									});

									button_5.disabled = $.get(currentIndex) === $.get(filteredModalAlerts).length - 1;

									styles_4 = $.set_style(button_5, '', styles_4, {
										cursor: $.get(currentIndex) !== $.get(filteredModalAlerts).length - 1 ? 'pointer' : undefined
									});
								});

								$.delegated('click', button_4, showPrevious);
								$.delegated('click', button_5, showNext);
								$.append($$anchor, div_10);
							};

							$.if(node_14, ($$render) => {
								if ($.get(filteredModalAlerts).length > 1) $$render(consequent_7);
							});
						}

						var div_12 = $.sibling(node_14, 2);
						var node_15 = $.child(div_12);

						$.component(node_15, () => Typography.Text, ($$anchor, Typography_Text_1) => {
							Typography_Text_1($$anchor, {
								variant: 'm-500',
								color: '--fgcolor-neutral-primary',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text();

									$.template_effect(() => $.set_text(text_6, $.get(currentModalAlert).title));
									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});
						});

						var span_4 = $.sibling(node_15, 2);
						var node_16 = $.child(span_4);

						{
							var consequent_8 = ($$anchor) => {
								var fragment_12 = $.comment();
								var node_17 = $.first_child(fragment_12);

								$.html(node_17, () => $.get(currentModalAlert).message);
								$.append($$anchor, fragment_12);
							};

							var alternate_3 = ($$anchor) => {
								var text_7 = $.text();

								$.template_effect(() => $.set_text(text_7, $.get(currentModalAlert).message));
								$.append($$anchor, text_7);
							};

							$.if(node_16, ($$render) => {
								if ($.get(currentModalAlert).isHtml) $$render(consequent_8); else $$render(alternate_3, -1);
							});
						}

						$.reset(span_4);
						$.reset(div_12);

						var div_13 = $.sibling(div_12, 2);
						var node_18 = $.child(div_13);

						{
							let $0 = $.derived(() => !$.get(hasOnlyPrimaryCta));
							let $1 = $.derived(() => resolveThemeColor($.get(currentModalAlert).cta.background));
							let $2 = $.derived(() => resolveThemeColor($.get(currentModalAlert).cta.backgroundHover));

							$.css_props(node_18, () => ({
								'--bgcolor-accent': $.get($1),
								'--bgcolor-accent-secondary': $.get($2)
							}));

							Button(node_18.lastChild, {
								size: 'xs',
								get secondary() {
									return $.get($0);
								},
								class: 'button',
								fullWidthMobile: true,
								$$events: {
									click: () => {
										$.set(openModalOnMobile, false);
										triggerWindowLink($.get(currentModalAlert));
									}
								},

								children: ($$anchor, $$slotProps) => {
									var span_5 = root_3();
									let styles_5;
									var text_8 = $.only_child(span_5, true);

									$.template_effect(
										($0) => {
											styles_5 = $.set_style(span_5, '', styles_5, { color: $0 });
											$.set_text(text_8, $.get(shouldShowUpgrade) ? 'Upgrade plan' : $.get(currentModalAlert).cta.text);
										},
										[() => resolveThemeColor($.get(currentModalAlert).cta.color)]
									);

									$.append($$anchor, span_5);
								},
								$$slots: { default: true }
							});

							$.reset(node_18);
						}

						var node_19 = $.sibling(node_18, 2);

						{
							var consequent_9 = ($$anchor) => {
								{
									let $0 = $.derived(() => $.get(currentModalAlert).learnMore.link({ project: $project(), organization: $organization() }));

									Button($$anchor, {
										text: true,
										size: 'xs',
										class: 'button',
										external: true,
										fullWidthMobile: true,
										get href() {
											return $.get($0);
										},
										$$events: { click: () => $.set(openModalOnMobile, false) },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_9 = $.text();

											$.template_effect(() => $.set_text(text_9, $.get(currentModalAlert).learnMore.text));
											$.append($$anchor, text_9);
										},
										$$slots: { default: true }
									});
								}
							};

							$.if(node_19, ($$render) => {
								if ($.get(currentModalAlert).learnMore) $$render(consequent_9);
							});
						}

						$.reset(div_13);
						$.reset(div_9);
						$.delegated('click', button_3, () => handleClose());
						$.append($$anchor, fragment_9);
					});

					$.reset(article_1);
					$.reset(div_8);
					$.append($$anchor, div_8);
				};

				var alternate_5 = ($$anchor) => {
					const mobileConfig = $.derived(getMobileWindowConfig);
					var div_14 = root_6();
					let classes_5;
					var div_15 = $.child(div_14);
					var div_16 = $.child(div_15);
					var node_20 = $.child(div_16);

					$.component(node_20, () => Typography.Text, ($$anchor, Typography_Text_2) => {
						Typography_Text_2($$anchor, {
							variant: 'm-500',
							color: '--fgcolor-neutral-primary',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_10 = $.text();

								$.template_effect(() => $.set_text(text_10, $.get(mobileConfig).title));
								$.append($$anchor, text_10);
							},
							$$slots: { default: true }
						});
					});

					var button_6 = $.sibling(node_20, 2);

					$.reset(div_16);

					var span_6 = $.sibling(div_16, 2);
					var node_21 = $.child(span_6);

					{
						var consequent_11 = ($$anchor) => {
							var fragment_17 = $.comment();
							var node_22 = $.first_child(fragment_17);

							$.html(node_22, () => $.get(mobileConfig).message);
							$.append($$anchor, fragment_17);
						};

						var alternate_4 = ($$anchor) => {
							var text_11 = $.text();

							$.template_effect(() => $.set_text(text_11, $.get(mobileConfig).message));
							$.append($$anchor, text_11);
						};

						$.if(node_21, ($$render) => {
							if ($.get(mobileConfig).html) $$render(consequent_11); else $$render(alternate_4, -1);
						});
					}

					$.reset(span_6);
					$.reset(div_15);
					$.reset(div_14);
					$.template_effect(() => classes_5 = $.set_class(div_14, 1, 'card notification-card u-width-full-line svelte-16hzf6y', null, classes_5, { showing: !$.get(openModalOnMobile) }));

					$.delegated('click', div_14, () => {
						if ($.get(mobileConfig).cta) {
							// navigate manually!
							triggerMobileWindowLink();
						} else {
							$.set(openModalOnMobile, true);
						}
					});

					$.delegated('click', button_6, function (...$$args) {
						hideAllModalAlerts?.apply(this, $$args);
					});

					$.append($$anchor, div_14);
				};

				$.if(node_10, ($$render) => {
					if ($.get(openModalOnMobile)) $$render(consequent_10); else $$render(alternate_5, -1);
				});
			}

			$.reset(div_7);
			$.template_effect(() => classes_2 = $.set_class(div_7, 1, 'main-alert-wrapper is-only-mobile svelte-16hzf6y', null, classes_2, { closed: !$.get(openModalOnMobile) }));
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (!$.get(isOnOnboarding) && $.get(filteredModalAlerts).length > 0 && $.get(currentModalAlert)) $$render(consequent_12);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);