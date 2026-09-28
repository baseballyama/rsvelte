import * as $ from 'svelte/internal/server';
import { Box } from '.';
import { Layout } from '@appwrite.io/pink-svelte';

export default function BoxAvatar($$renderer, $$props) {
	Box($$renderer, {
		children: ($$renderer) => {
			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					direction: 'row',
					justifyContent: 'flex-start',
					alignItems: 'center',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);
						$.slot($$renderer, $$props, 'image', {}, null);
						$$renderer.push(`<!--]--> <div><!--[-->`);
						$.slot($$renderer, $$props, 'title', {}, null);
						$$renderer.push(`<!--]--> <!--[-->`);
						$.slot($$renderer, $$props, 'default', {}, null);
						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}