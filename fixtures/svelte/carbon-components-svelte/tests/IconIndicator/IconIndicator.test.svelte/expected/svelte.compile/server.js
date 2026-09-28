import * as $ from 'svelte/internal/server';
import IconIndicator from "carbon-components-svelte/IconIndicator/IconIndicator.svelte";

export default function IconIndicator_test($$renderer) {
	IconIndicator($$renderer, { kind: 'failed', label: 'failed' });
	$$renderer.push(`<!----> `);
	IconIndicator($$renderer, { kind: 'caution-major', label: 'caution-major' });
	$$renderer.push(`<!----> `);
	IconIndicator($$renderer, { kind: 'caution-minor', label: 'caution-minor' });
	$$renderer.push(`<!----> `);
	IconIndicator($$renderer, { kind: 'undefined', label: 'undefined' });
	$$renderer.push(`<!----> `);
	IconIndicator($$renderer, { kind: 'succeeded', label: 'succeeded' });
	$$renderer.push(`<!----> `);
	IconIndicator($$renderer, { kind: 'normal', label: 'normal' });
	$$renderer.push(`<!----> `);
	IconIndicator($$renderer, { kind: 'in-progress', label: 'in-progress' });
	$$renderer.push(`<!----> `);
	IconIndicator($$renderer, { kind: 'incomplete', label: 'incomplete' });
	$$renderer.push(`<!----> `);
	IconIndicator($$renderer, { kind: 'not-started', label: 'not-started' });
	$$renderer.push(`<!----> `);
	IconIndicator($$renderer, { kind: 'pending', label: 'pending' });
	$$renderer.push(`<!----> `);
	IconIndicator($$renderer, { kind: 'unknown', label: 'unknown' });
	$$renderer.push(`<!----> `);
	IconIndicator($$renderer, { kind: 'informative', label: 'informative' });
	$$renderer.push(`<!----> `);
	IconIndicator($$renderer, { kind: 'failed', label: 'size 20', size: 20 });
	$$renderer.push(`<!----> `);

	IconIndicator($$renderer, {
		kind: 'failed',
		label: 'custom attrs',
		class: 'custom-class',
		'data-testid': 'attr-test'
	});

	$$renderer.push(`<!----> `);

	IconIndicator($$renderer, {
		kind: 'failed',
		label: 'Default label',
		'data-testid': 'label-children-test',
		$$slots: {
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren">Custom label content</span>`);
			}
		}
	});

	$$renderer.push(`<!---->`);
}