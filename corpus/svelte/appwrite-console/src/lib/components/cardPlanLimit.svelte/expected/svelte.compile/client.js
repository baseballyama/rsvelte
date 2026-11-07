import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/elements/forms';
import { getChangePlanUrl } from '$lib/stores/billing';
import { Click, trackEvent } from '$lib/actions/analytics';
import { organization } from '$lib/stores/organization';
import { project } from '$routes/(console)/project-[region]-[project]/store';

var root = $.from_html(`<article class="card u-grid u-cross-center u-width-full-line"><div class="u-flex u-flex-vertical u-gap-24 u-main-center u-cross-center"><p class="text u-text-center"> </p> <!></div></article>`);

export default function CardPlanLimit($$anchor, $$props) {
	$.push($$props, true);

	const $project = () => $.store_get(project, '$project', $$stores);
	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const organizationId = $.derived(() => {
		return $project().teamId ?? $organization().$id;
	});

	var article = root();
	var div = $.child(article);
	var p = $.child(div);
	var text = $.only_child(p);
	var node = $.sibling(p, 2);

	{
		let $0 = $.derived(() => getChangePlanUrl($.get(organizationId)));

		Button(node, {
			secondary: true,
			get href() {
				return $.get($0);
			},

			$$events: {
				click: () => {
					trackEvent(Click.OrganizationClickUpgrade, { source: 'card_plan_limit' });
				}
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Change plan');

				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.reset(article);
	$.template_effect(() => $.set_text(text, `Upgrade your plan to add more ${$$props.service ?? ''}`));
	$.append($$anchor, article);
	$.pop();
	$$cleanup();
}