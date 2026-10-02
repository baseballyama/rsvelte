import * as $ from 'svelte/internal/server';
import Props from '../$$props-valid/input.svelte';
import PropsInvalid3 from './$$props-invalid3.svelte';

export default function Input($$renderer) {
	Props($$renderer, { exported1: 'valid', exported2: 'valid', exported3: 'valid' });
	$$renderer.push(`<!----> `);

	PropsInvalid3($$renderer, {
		exported1: // @ts-expect-error
		true
	});

	$$renderer.push(`<!----> `);
	Props($$renderer, { exported1: true, exported2: 'valid' });
	$$renderer.push(`<!----> `);
	Props($$renderer, { exported1: 'valid', exported2: 'valid', invalidProp: true });
	$$renderer.push(`<!----> `);
	Props($$renderer, {});
	$$renderer.push(`<!---->`);
}