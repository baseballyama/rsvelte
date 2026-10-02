import * as $ from 'svelte/internal/server';
import { scale } from 'svelte/transition';
import { flash as flashOnUpdate } from '../attachments/update-flash.svelte.js';
import { useOptions } from '../options.svelte.js';
import Bullet from './Bullet.svelte';
import Caret from './icons/Caret.svelte';

export default function CollapseButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			collapsed = void 0,
			onchange,
			disabled,
			value,
			key,
			type,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let flashing = false;
		let childflash = false;
		let options = useOptions();

		let rotation = $.derived(() => {
			if (collapsed) return 0;

			return 90;
		});

		function flash() {
			if (childflash) return;

			childflash = true;

			window.setTimeout(
				() => {
					childflash = false;
				},
				options.flashDuration
			);
		}

		function flashButton() {
			if (flashing) return;

			flashing = true;

			window.setTimeout(
				() => {
					flashing = false;
				},
				options.flashDuration
			);
		}

		let keyOrType = $.derived(() => (key ?? type)?.toString());

		$$renderer.push(`<div${$.attributes(
			{
				'data-testid': 'collapse-button',
				class: $.clsx([
					'collapse',
					flashing && 'flashing',
					childflash && 'child-flash'
				]),
				'aria-label': `${collapsed ? 'expand' : 'collapse'} ${keyOrType()}`,
				...rest
			},
			'svelte-upkuqn',
			void 0,
			{ '--flash-duration': options.flashDuration }
		)}>`);

		if (disabled) {
			$$renderer.push('<!--[0-->');
			Bullet($$renderer, {});
		} else {
			$$renderer.push(`<!--[-1--><div class="caret-transition svelte-upkuqn">`);

			Caret($$renderer, {
				style: `rotate:${$.stringify(rotation())}deg;
        transition: rotate var(--__transition-duration) var(--_back-out);
        width: 100%; height: 100%;`
			});

			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { collapsed, flash, flashButton });
	});
}