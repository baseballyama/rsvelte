import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { invalidate } from '$app/navigation';
import { Modal } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { Dependencies } from '$lib/constants';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';

var root = $.from_html(`<p class="text">Are you sure you want to disable the Premium Geo DB addon? The addon will remain active
        until the end of your current billing cycle and will not be renewed.</p>`);

var root_1 = $.from_html(`<!> <!>`, 1);

export default function PremiumGeoDBDisableModal($$anchor, $$props) {
	$.push($$props, true);

	let show = $.prop($$props, 'show', 15, false);
	let error = $.state(null);
	let submitting = $.state(false);

	async function handleSubmit() {
		$.set(submitting, true);
		$.set(error, null);

		try {
			await sdk.forConsoleIn(page.params.region).projects.deleteAddon({ projectId: page.params.project, addonId: $$props.addonId });

			await Promise.all([
				invalidate(Dependencies.ADDONS),
				invalidate(Dependencies.PROJECT)
			]);

			addNotification({
				message: 'Premium Geo DB addon will be removed at the end of your current billing cycle',
				type: 'success'
			});

			show(false);
		} catch(e) {
			$.set(error, e.message, true);
		} finally {
			$.set(submitting, false);
		}
	}

	Modal($$anchor, {
		onSubmit: handleSubmit,
		title: 'Disable Premium Geo DB',
		get error() {
			return $.get(error);
		},

		set error($$value) {
			$.set(error, $$value, true);
		},

		get show() {
			return show();
		},

		set show($$value) {
			show($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var p = root();

			$.append($$anchor, p);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node = $.first_child(fragment_1);

				Button(node, {
					text: true,
					$$events: { click: () => show(false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Cancel');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_1 = $.sibling(node, 2);

				Button(node_1, {
					secondary: true,
					submit: true,
					get disabled() {
						return $.get(submitting);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Disable Premium Geo DB');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			}
		}
	});

	$.pop();
}