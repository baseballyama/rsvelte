import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Click, trackEvent } from '$lib/actions/analytics';
import { CardGrid, EmptyCardImageCloud } from '$lib/components';
import Button from '$lib/elements/forms/button.svelte';
import { app } from '$lib/stores/app';
import { getChangePlanUrl } from '$lib/stores/billing';
import EmailDark from './email-footer-dark.png';
import EmailLight from './email-footer-light.png';
import EmailMobileDark from './email-footer-mobile-dark.png';
import EmailMobileLight from './email-footer-mobile-light.png';

var root = $.from_html(`<img class="u-image-object-fit-cover u-only-dark u-width-full-line u-height-100-percent" alt="Email Signature Example"/>`);
var root_1 = $.from_html(`<img class="u-image-object-fit-cover u-only-light u-width-full-line u-height-100-percent" alt="Email Signature Example"/>`);
var root_2 = $.from_html(`<img width="266" alt="Email Signature Example"/>`);
var root_3 = $.from_html(`<div class=" is-only-mobile u-width-full-line u-height-100-percent"><!></div> <div class="is-not-mobile u-width-full-line u-height-100-percent"><!></div>`, 1);

export default function EmailSignature($$anchor, $$props) {
	$.push($$props, true);

	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	CardGrid($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Enable or disable Appwrite branding in your email template signature.');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text('Email signature');

				$.append($$anchor, text_1);
			},

			aside: ($$anchor, $$slotProps) => {
				EmptyCardImageCloud($$anchor, {
					responsive: true,
					source: 'email_signature_card',
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$anchor, $$slotProps) => {
							const nextTier = $.derived(() => $$slotProps.nextTier);

							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, `Upgrade to a ${$.get(nextTier) ?? ''} plan to remove the Appwrite branding from your emails.`));
							$.append($$anchor, text_2);
						},

						image: ($$anchor, $$slotProps) => {
							var fragment_3 = root_3();
							var div = $.first_child(fragment_3);
							var node = $.child(div);

							{
								var consequent = ($$anchor) => {
									var img = root();

									$.template_effect(() => $.set_attribute(img, 'src', EmailMobileDark));
									$.append($$anchor, img);
								};

								var alternate = ($$anchor) => {
									var img_1 = root_1();

									$.template_effect(() => $.set_attribute(img_1, 'src', EmailMobileLight));
									$.append($$anchor, img_1);
								};

								$.if(node, ($$render) => {
									if ($app().themeInUse === 'dark') $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.reset(div);

							var div_1 = $.sibling(div, 2);
							var node_1 = $.child(div_1);

							{
								var consequent_1 = ($$anchor) => {
									var img_2 = root_2();

									$.set_style(img_2, '', {}, { 'object-position': 'top' });
									$.template_effect(() => $.set_attribute(img_2, 'src', EmailDark));
									$.append($$anchor, img_2);
								};

								var alternate_1 = ($$anchor) => {
									var img_3 = root_2();

									$.set_style(img_3, '', {}, { 'object-position': 'top' });
									$.template_effect(() => $.set_attribute(img_3, 'src', EmailLight));
									$.append($$anchor, img_3);
								};

								$.if(node_1, ($$render) => {
									if ($app().themeInUse === 'dark') $$render(consequent_1); else $$render(alternate_1, -1);
								});
							}

							$.reset(div_1);
							$.append($$anchor, fragment_3);
						},

						title: ($$anchor, $$slotProps) => {
							var text_3 = $.text('Upgrade to remove Appwrite branding');

							$.append($$anchor, text_3);
						},

						cta: ($$anchor, $$slotProps) => {
							const source = $.derived(() => $$slotProps.source);

							{
								let $0 = $.derived(() => getChangePlanUrl($$props.project.teamId));

								Button($$anchor, {
									class: 'u-margin-block-start-32',
									secondary: true,
									fullWidth: true,
									get href() {
										return $.get($0);
									},

									$$events: {
										click: () => {
											trackEvent(Click.OrganizationClickUpgrade, { from: 'button', source: $.get(source) });
										}
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Upgrade plan');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							}
						}
					}
				});
			}
		}
	});

	$.pop();
	$$cleanup();
}