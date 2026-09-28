import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Banner, { Label } from '@smui/banner';
import Button from '@smui/button';

export default function _Fixed($$anchor) {
	{
		const label = ($$anchor) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('This is a fixed banner! It\'s here to let you know an important thing. Once\n      you\'ve successfully known the thing, you can dismiss it.');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		const actions = ($$anchor) => {
			Button($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('I Know It');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		};

		Banner($$anchor, {
			open: true,
			fixed: true,
			mobileStacked: true,
			content$style: 'max-width: max-content;',
			label,
			actions,
			$$slots: { label: true, actions: true }
		});
	}
}