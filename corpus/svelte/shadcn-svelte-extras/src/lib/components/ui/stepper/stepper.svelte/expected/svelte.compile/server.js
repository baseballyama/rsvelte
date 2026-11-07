import * as $ from 'svelte/internal/server';
import { useStepperRoot } from './stepper.svelte.js';
import { box } from 'svelte-toolbelt';

export default function Stepper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { step = 1, children } = $$props;

		useStepperRoot({ step: box.with(() => step, (v) => step = v) });
		children?.($$renderer);
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { step });
	});
}