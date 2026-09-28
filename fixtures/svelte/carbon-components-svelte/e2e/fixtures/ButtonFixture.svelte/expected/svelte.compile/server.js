import * as $ from 'svelte/internal/server';
import { Button } from "carbon-components-svelte";

export default function ButtonFixture($$renderer) {
	let clickCount = 0;

	Button($$renderer, {
		'data-testid': 'button-primary',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Primary`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		'data-testid': 'button-disabled',
		disabled: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		kind: 'secondary',
		'data-testid': 'button-secondary',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Secondary`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	if (clickCount > 0) {
		$$renderer.push(`<!--[0--><p data-testid="click-count">Clicked: ${$.escape(clickCount)}</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}