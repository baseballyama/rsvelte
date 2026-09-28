import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { sdk } from '$lib/stores/sdk';
import { addNotification } from '$lib/stores/notifications';
import { invalidate } from '$app/navigation';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { Dependencies } from '$lib/constants';
import { Confirm } from '$lib/components';
import { Typography } from '@appwrite.io/pink-svelte';
import { page } from '$app/state';

export default function DeleteDomainModal($$anchor, $$props) {
	$.push($$props, true);

	let show = $.prop($$props, 'show', 15);
	let error = $.state(null);

	async function deleteDomain() {
		try {
			await sdk.forProject(page.params.region, page.params.project).proxy.deleteRule({ ruleId: $$props.selectedDomain.$id });
			await invalidate(Dependencies.DOMAINS);
			show(false);
			addNotification({ type: 'success', message: `Domain has been deleted` });
			trackEvent(Submit.DomainDelete);
		} catch(e) {
			$.set(error, e.message, true);
			trackError(e, Submit.DomainDelete);
		}
	}

	Confirm($$anchor, {
		title: 'Delete domain',
		onSubmit: deleteDomain,
		confirmDeletion: true,
		get open() {
			return show();
		},

		set open($$value) {
			show($$value);
		},

		get error() {
			return $.get(error);
		},

		set error($$value) {
			$.set(error, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.component(node_1, () => Typography.Text, ($$anchor, Typography_Text) => {
						Typography_Text($$anchor, {
							variant: 'm-400',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Are you sure you want to delete this domain?');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node, ($$render) => {
					if ($$props.selectedDomain) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}