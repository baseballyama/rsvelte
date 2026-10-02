import * as $ from 'svelte/internal/server';

export default function WizardSecondaryFooter($$renderer, $$props) {
	$$renderer.push(`<div class="wizard-secondary-options"><div class="wizard-secondary-options-start"><!--[-->`);
	$.slot($$renderer, $$props, 'start', {}, null);
	$$renderer.push(`<!--]--></div> <div class="wizard-secondary-options-end"><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></div></div>`);
}