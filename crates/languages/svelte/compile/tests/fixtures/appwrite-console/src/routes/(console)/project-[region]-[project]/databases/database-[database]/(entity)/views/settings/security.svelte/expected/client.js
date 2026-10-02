import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { trackEvent, trackError } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Button, InputSwitch } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { getTerminologies } from '$database/(entity)';

var root = $.from_html(`<!> <p class="text"> <b> </b>.</p> <p class="text"> <b> </b> </p>`, 1);

export default function Security($$anchor, $$props) {
	$.push($$props, true);

	let recordSecurity = $.state($.proxy($$props.entity.recordSecurity));
	const hasChanges = $.derived(() => $.get(recordSecurity) !== $$props.entity.recordSecurity);

	async function cleanup() {
		// events and notif!
		trackEvent(analytics.submit.entity('UpdateSecurity'));

		addNotification({
			message: `${$$props.entity.name} has been updated`,
			type: 'success'
		});

		// invalidate proper dependency.
		await invalidate(dependencies.entity.singular);
	}

	async function updateSecurity() {
		try {
			await $$props.onChangeSecurity($.get(recordSecurity));
			await cleanup();
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, analytics.submit.entity('UpdateSecurity'));
		}
	}

	const { analytics, dependencies, terminology } = getTerminologies();
	const title = terminology.record.title.singular;
	const recordLower = terminology.record.lower.singular;
	const recordsLower = terminology.record.lower.plural;
	const entityLower = terminology.entity.lower.singular;

	CardGrid($$anchor, {
		$$slots: {
			title: ($$anchor, $$slotProps) => {
				var text = $.text();

				$.template_effect(() => $.set_text(text, `${title ?? ''} security`));
				$.append($$anchor, text);
			},

			aside: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node = $.first_child(fragment_2);

				InputSwitch(node, {
					id: 'security',
					get label() {
						return `${title ?? ''} security`;
					},

					get value() {
						return $.get(recordSecurity);
					},

					set value($$value) {
						$.set(recordSecurity, $$value, true);
					}
				});

				var p = $.sibling(node, 2);
				var text_1 = $.child(p);
				var b = $.sibling(text_1);
				var text_2 = $.only_child(b);

				$.next();
				$.reset(p);

				var p_1 = $.sibling(p, 2);
				var text_3 = $.child(p_1);
				var b_1 = $.sibling(text_3);
				var text_4 = $.only_child(b_1);
				var text_5 = $.sibling(b_1);

				$.reset(p_1);

				$.template_effect(() => {
					$.set_text(text_1, `When ${recordLower ?? ''} security is enabled, users will be able to access ${recordsLower ?? ''}
            for which they have been granted `);

					$.set_text(text_2, `either ${recordLower ?? ''} or ${entityLower ?? ''} permissions`);
					$.set_text(text_3, `If ${recordLower ?? ''} security is disabled, users can access ${recordsLower ?? ''} `);
					$.set_text(text_4, `only if they have ${entityLower ?? ''} permissions`);
					$.set_text(text_5, `. ${title ?? ''} permissions will be ignored.`);
				});

				$.append($$anchor, fragment_2);
			},

			actions: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => !$.get(hasChanges));

					Button($$anchor, {
						get disabled() {
							return $.get($0);
						},
						$$events: { click: updateSecurity },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Update');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				}
			}
		}
	});

	$.pop();
}