import * as $ from 'svelte/internal/server';
import Banner, { Label } from '@smui/banner';
import Button from '@smui/button';

export default function _Fixed($$renderer) {
	{
		function label($$renderer) {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->This is a fixed banner! It's here to let you know an important thing. Once
      you've successfully known the thing, you can dismiss it.`);
				},
				$$slots: { default: true }
			});
		}

		function actions($$renderer) {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->I Know It`);
				},
				$$slots: { default: true }
			});
		}

		Banner($$renderer, {
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