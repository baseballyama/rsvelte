import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Modal } from '$lib/components';
import { Alert } from '@appwrite.io/pink-svelte';
import Button from '$lib/elements/forms/button.svelte';

export default function FailedModal($$anchor, $$props) {
	$.push($$props, true);

	let show = $.prop($$props, 'show', 15);

	Modal($$anchor, {
		get title() {
			return $$props.title;
		},
		size: 's',
		get show() {
			return show();
		},

		set show($$value) {
			show($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Alert.Inline, ($$anchor, Alert_Inline) => {
				Alert_Inline($$anchor, {
					get title() {
						return $$props.header;
					},
					status: 'error',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $$props.error));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				Button($$anchor, {
					secondary: true,
					$$events: { click: () => show(false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Close');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	$.pop();
}