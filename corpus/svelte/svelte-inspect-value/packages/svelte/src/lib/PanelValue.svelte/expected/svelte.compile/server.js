import * as $ from 'svelte/internal/server';
import NodeActionButton from './components/NodeActionButton.svelte';
import { addToPanel, globalValues } from './global.svelte.js';
import { globalInspectState } from './Panel.svelte';
import Wrapper from './Wrapper.svelte';

export default function PanelValue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { key, value, label = 'PanelValue', renderIf = false } = $$props;

		function setAsPanelValue() {
			globalValues.set(key, { value: () => value, note: { title: 'Added manually' } });
		}

		if (Boolean(renderIf)) {
			$$renderer.push('<!--[0-->');

			Wrapper($$renderer, {
				class: ['borderless'],
				style: 'max-width: 2em; min-width: 2em;',
				children: ($$renderer) => {
					$$renderer.push(`<div style="padding: 2px;">`);

					if (!globalValues.has(key) && globalInspectState.mounted.size) {
						$$renderer.push('<!--[0-->');

						NodeActionButton($$renderer, {
							title: 'Add to panel',
							onclick: setAsPanelValue,
							children: ($$renderer) => {
								$$renderer.push(`<!---->+`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (globalValues.has(key)) {
						$$renderer.push('<!--[0-->');

						NodeActionButton($$renderer, {
							title: 'Remove from panel',
							onclick: () => globalValues.delete(key),
							children: ($$renderer) => {
								$$renderer.push(`<!---->-`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}