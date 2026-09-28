import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, Typography, Icon } from '@appwrite.io/pink-svelte';
import { IconCheck, IconX, IconLockClosed } from '@appwrite.io/pink-icons-svelte';
import { Button } from '$lib/elements/forms';
import { resolveOAuth2AppLogoUrl } from '$lib/helpers/oauth2-app-logo';

var root = $.from_html(`<img class="avatar svelte-5dangw"/>`);
var root_1 = $.from_html(`<div class="avatar placeholder svelte-5dangw"> </div>`);
var root_2 = $.from_html(`<span class="connector svelte-5dangw"><span class="connector-line svelte-5dangw"></span> <span class="connector-node svelte-5dangw"><!></span> <span class="connector-line svelte-5dangw"></span></span> <div class="avatar account svelte-5dangw"> </div>`, 1);
var root_3 = $.from_html(`<span><!></span>`);
var root_4 = $.from_html(`<!> <p class="close-hint svelte-5dangw">It's safe to close this tab.</p>`, 1);
var root_5 = $.from_html(`<span>You can revoke access anytime in your account settings</span>`);
var root_6 = $.from_html(`<span> </span>`);
var root_7 = $.from_html(`<div><header class="header svelte-5dangw"><div class="identity svelte-5dangw"><!> <!></div> <div class="headline svelte-5dangw"><!> <!></div></header> <div class="body svelte-5dangw"><!> <p class="footnote svelte-5dangw"><!> <!></p></div></div>`);

export default function Outcome_card($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * Present when the client redirect is a native deep link (cursor://…).
	 * The browser already attempted it once; the button retries it for users
	 * who dismissed the OS "open application" prompt.
	 */
	let app = $.prop($$props, 'app', 3, null),
		accountLabel = $.prop($$props, 'accountLabel', 3, undefined),
		redirectUrl = $.prop($$props, 'redirectUrl', 3, undefined);

	const approved = $.derived(() => $$props.outcome === 'approved');
	const appName = $.derived(() => app()?.name ?? 'the application');
	const appLogoUrl = $.derived(() => resolveOAuth2AppLogoUrl(app()));
	const appInitial = $.derived(() => (app()?.name || '?').charAt(0).toUpperCase());
	const accountInitial = $.derived(() => (accountLabel() || '?').charAt(0).toUpperCase());

	const title = $.derived(() => $.get(approved)
		? $$props.flow === 'device' ? 'Device connected' : 'Access granted'
		: 'Request cancelled');

	const message = $.derived(() => {
		if (!$.get(approved)) {
			return `No access was granted to ${$.get(appName)}. You can close this tab.`;
		}

		if ($$props.flow === 'device') {
			return `You've authorized ${$.get(appName)}. Return to your device — it will continue automatically.`;
		}

		if (redirectUrl()) {
			return `Return to ${$.get(appName)} to continue. If it didn't open automatically, use the button below.`;
		}

		return `Return to ${$.get(appName)} to continue. You can close this tab.`;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Base, ($$anchor, Card_Base) => {
		Card_Base($$anchor, {
			padding: 'none',
			radius: 'l',
			style: 'width: 100%; overflow: hidden;',
			children: ($$anchor, $$slotProps) => {
				var div = root_7();
				let classes;
				var header = $.child(div);
				var div_1 = $.child(header);
				var node_1 = $.child(div_1);

				{
					var consequent = ($$anchor) => {
						var img = root();

						$.template_effect(() => {
							$.set_attribute(img, 'src', $.get(appLogoUrl));
							$.set_attribute(img, 'alt', $.get(appName));
						});

						$.append($$anchor, img);
					};

					var alternate = ($$anchor) => {
						var div_2 = root_1();
						var text = $.only_child(div_2, true);

						$.template_effect(() => $.set_text(text, $.get(appInitial)));
						$.append($$anchor, div_2);
					};

					$.if(node_1, ($$render) => {
						if ($.get(appLogoUrl)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				var node_2 = $.sibling(node_1, 2);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_1 = root_2();
						var span = $.first_child(fragment_1);
						var span_1 = $.sibling($.child(span), 2);
						var node_3 = $.child(span_1);

						{
							let $0 = $.derived(() => $.get(approved) ? IconCheck : IconX);

							Icon(node_3, {
								get icon() {
									return $.get($0);
								},
								size: 's'
							});
						}

						$.reset(span_1);
						$.next(2);
						$.reset(span);

						var div_3 = $.sibling(span, 2);
						var text_1 = $.only_child(div_3, true);

						$.template_effect(() => $.set_text(text_1, $.get(accountInitial)));
						$.append($$anchor, fragment_1);
					};

					var alternate_1 = ($$anchor) => {
						var span_2 = root_3();
						let classes_1;
						var node_4 = $.child(span_2);

						{
							let $0 = $.derived(() => $.get(approved) ? IconCheck : IconX);

							Icon(node_4, {
								get icon() {
									return $.get($0);
								},
								size: 's'
							});
						}

						$.reset(span_2);
						$.template_effect(() => classes_1 = $.set_class(span_2, 1, 'status-badge svelte-5dangw', null, classes_1, { approved: $.get(approved) }));
						$.append($$anchor, span_2);
					};

					$.if(node_2, ($$render) => {
						if (accountLabel()) $$render(consequent_1); else $$render(alternate_1, -1);
					});
				}

				$.reset(div_1);

				var div_4 = $.sibling(div_1, 2);
				var node_5 = $.child(div_4);

				$.component(node_5, () => Typography.Title, ($$anchor, Typography_Title) => {
					Typography_Title($$anchor, {
						size: 'm',
						align: 'center',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, $.get(title)));
							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => Typography.Text, ($$anchor, Typography_Text) => {
					Typography_Text($$anchor, {
						variant: 'm-400',
						align: 'center',
						color: '--fgcolor-neutral-secondary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text();

							$.template_effect(() => $.set_text(text_3, $.get(message)));
							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_4);
				$.reset(header);

				var div_5 = $.sibling(header, 2);
				var node_7 = $.child(div_5);

				{
					var consequent_2 = ($$anchor) => {
						var fragment_4 = root_4();
						var node_8 = $.first_child(fragment_4);

						Button(node_8, {
							fullWidth: true,
							$$events: { click: () => window.location.href = redirectUrl() },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text();

								$.template_effect(() => $.set_text(text_4, `Open ${app()?.name ?? 'application' ?? ''}`));
								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						});

						$.next(2);
						$.append($$anchor, fragment_4);
					};

					$.if(node_7, ($$render) => {
						if ($.get(approved) && redirectUrl()) $$render(consequent_2);
					});
				}

				var p = $.sibling(node_7, 2);
				var node_9 = $.child(p);

				Icon(node_9, {
					get icon() {
						return IconLockClosed;
					},
					size: 's'
				});

				var node_10 = $.sibling(node_9, 2);

				{
					var consequent_3 = ($$anchor) => {
						var span_3 = root_5();

						$.append($$anchor, span_3);
					};

					var alternate_2 = ($$anchor) => {
						var span_4 = root_6();
						var text_5 = $.only_child(span_4);

						$.template_effect(() => $.set_text(text_5, `${$.get(appName) ?? ''} was not given access to your account`));
						$.append($$anchor, span_4);
					};

					$.if(node_10, ($$render) => {
						if ($.get(approved)) $$render(consequent_3); else $$render(alternate_2, -1);
					});
				}

				$.reset(p);
				$.reset(div_5);
				$.reset(div);
				$.template_effect(() => classes = $.set_class(div, 1, 'outcome svelte-5dangw', null, classes, { approved: $.get(approved) }));
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}