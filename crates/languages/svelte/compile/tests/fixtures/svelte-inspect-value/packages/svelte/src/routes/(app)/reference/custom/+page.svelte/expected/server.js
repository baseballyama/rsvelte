import * as $ from 'svelte/internal/server';
import MultiCode from '$doclib/examples/MultiCode.svelte';
import { createPageTitle } from '$doclib/util.js';
import { Inspect, addComponent } from '$lib/index.js';
import CustomNumber from './CustomNumber.svelte';
import customNumberCode from './CustomNumber.txt?raw';
import ErrorOnHover from './ErrorOnHover.svelte';
import code from './example.txt?raw';
import ExpandableNumber from './ExpandableNumber.svelte';
import HexString from './HexString.svelte';
import customStringCode from './HexString.txt?raw';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const anObject = {
			oneBillion: 1000000000,
			oneTwoThreeFourEtc: 1234567890,
			maxSafe: Number.MAX_SAFE_INTEGER,
			red: '#FF0000',
			pink: '#FF00FF',
			yella: '#FFFF00',
			notAColor: 'hello'
		};

		let showString = false;

		const customComponents = $.derived(() => ({
			number: [CustomNumber],
			string: addComponent(HexString, (props) => ({ showString, value: props.value }), (props) => props.value.startsWith('#'))
		}));

		$.head('mx51e9', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(createPageTitle('Custom Components'))}</title>`);
			});
		});

		$$renderer.push(`<h2>Custom Components <sup>beta</sup></h2> <p><code>svelte-inspect-value</code> aims to (eventually) export all the building blocks to extend the
  component with custom components.</p> <p>Better documentation soon! Here's a minimal example:</p> <h3>Custom line</h3>  `);

		MultiCode($$renderer, {
			examples: [
				{ code, label: '+page.svelte', language: 'svelte' },
				{
					code: customNumberCode,
					label: 'GoofyNumber.svelte',
					language: 'svelte'
				},

				{
					code: customStringCode,
					label: 'HexString.svelte',
					language: 'svelte'
				}
			]
		});

		$$renderer.push(`<!----> Result `);

		Inspect($$renderer, {
			value: anObject,
			customComponents: customComponents(),
			name: 'numbersAndColors'
		});

		$$renderer.push(`<!----> <label class="flex row align-center">show string for custom string component <input type="checkbox"${$.attr('checked', showString, true)}/></label> <h3>Custom expandable</h3> *Custom expandables API is still unfinished `);
		Inspect($$renderer, { value: 2, customComponents: { number: [ExpandableNumber] } });

		$$renderer.push(`<!----> <h2>Error handling</h2> <p>If any component, built-in or custom, should throw an error it will be caught by a boundary on an
  entry-per-entry basis and render error details.<br/> The error value display component reverts to using default components to avoid further issues.</p> `);

		Inspect($$renderer, {
			value: {
				'clickToError👉': 'click me',
				hey: 'dont click me i will error'
			},
			name: 'customString',
			customComponents: { string: [ErrorOnHover] }
		});

		$$renderer.push(`<!---->`);
	});
}