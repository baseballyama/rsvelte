import * as $ from 'svelte/internal/server';

export default function PreviewSwitch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { title = '', checked = false, isDisabled = false, onChange } = $$props;

		function toggle() {
			if (isDisabled) return;

			onChange?.(!checked);
		}

		function onKey(e) {
			if (e.key === ' ' || e.key === 'Enter') {
				e.preventDefault();
				toggle();
			}
		}

		$$renderer.push(`<div class="scrubber"><button type="button" class="scrubber-track scrubber-track--switch" role="switch"${$.attr('aria-checked', checked)}${$.attr('aria-label', title)}${$.attr('aria-disabled', isDisabled)}${$.attr('data-disabled', isDisabled)}${$.attr('data-checked', checked)}><div class="scrubber-label">${$.escape(title)}</div> <div class="scrubber-switch-toggle"><div class="scrubber-switch-knob"></div></div></button></div>`);
	});
}