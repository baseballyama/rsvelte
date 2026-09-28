import * as $ from 'svelte/internal/server';
import { flash } from '../attachments/update-flash.svelte.js';
import { useOptions } from '../options.svelte.js';

export default function Bullet($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = undefined } = $$props;
		let flashing = false;
		let options = useOptions();

		const $$d = $.derived(() => options.value),
			flashOnUpdate = $.derived(() => $$d().flashOnUpdate),
			noanimate = $.derived(() => $$d().noanimate);

		function flashBullet() {
			if (flashing) return;

			flashing = true;

			window.setTimeout(
				() => {
					flashing = false;
				},
				options.flashDuration
			);
		}

		$$renderer.push(`<div class="bullet svelte-utdyfi" role="presentation"><div${$.attr('aria-hidden', true)}${$.attr_class('dash svelte-utdyfi', void 0, { 'flashing': flashing, 'noanimate': noanimate() })}></div></div>`);
		$.bind_props($$props, { flashBullet });
	});
}