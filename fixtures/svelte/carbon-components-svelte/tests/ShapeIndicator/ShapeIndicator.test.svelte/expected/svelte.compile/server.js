import * as $ from 'svelte/internal/server';
import ShapeIndicator from "carbon-components-svelte/ShapeIndicator/ShapeIndicator.svelte";

export default function ShapeIndicator_test($$renderer) {
	ShapeIndicator($$renderer, { kind: 'failed', label: 'failed' });
	$$renderer.push(`<!----> `);
	ShapeIndicator($$renderer, { kind: 'critical', label: 'critical' });
	$$renderer.push(`<!----> `);
	ShapeIndicator($$renderer, { kind: 'high', label: 'high' });
	$$renderer.push(`<!----> `);
	ShapeIndicator($$renderer, { kind: 'medium', label: 'medium' });
	$$renderer.push(`<!----> `);
	ShapeIndicator($$renderer, { kind: 'low', label: 'low' });
	$$renderer.push(`<!----> `);
	ShapeIndicator($$renderer, { kind: 'cautious', label: 'cautious' });
	$$renderer.push(`<!----> `);
	ShapeIndicator($$renderer, { kind: 'undefined', label: 'undefined' });
	$$renderer.push(`<!----> `);
	ShapeIndicator($$renderer, { kind: 'stable', label: 'stable' });
	$$renderer.push(`<!----> `);
	ShapeIndicator($$renderer, { kind: 'informative', label: 'informative' });
	$$renderer.push(`<!----> `);
	ShapeIndicator($$renderer, { kind: 'incomplete', label: 'incomplete' });
	$$renderer.push(`<!----> `);
	ShapeIndicator($$renderer, { kind: 'draft', label: 'draft' });
	$$renderer.push(`<!----> `);
	ShapeIndicator($$renderer, { kind: 'failed', label: 'text size 14', textSize: 14 });
	$$renderer.push(`<!----> `);

	ShapeIndicator($$renderer, {
		kind: 'failed',
		label: 'custom attrs',
		class: 'custom-class',
		'data-testid': 'attr-test'
	});

	$$renderer.push(`<!----> `);

	ShapeIndicator($$renderer, {
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