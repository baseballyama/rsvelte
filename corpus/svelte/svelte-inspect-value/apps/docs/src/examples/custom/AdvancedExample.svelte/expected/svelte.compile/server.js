import * as $ from 'svelte/internal/server';
import Inspect, { addComponent } from 'svelte-inspect-value';
import HexString from './HexString.svelte';

export default function AdvancedExample($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let showString = false;
		let useDefault = false;

		const components = {
			// Using the exported helper function enables proper typing for props
			// NOTE: the returned props can be considered overrides for props passed by Inspect
			// and does not need to be complete
			string: addComponent(
				HexString,
				// Optional props transform.
				// The custom prop `showString` will be reactive as this used $derived
				(props) => ({ showString, value: props.value }),
				// Optional predicate determines if custom component should be used (if true)
				// Uses default component if false
				(props) => props.value.startsWith('#') && !useDefault
			)
		};

		const value = {
			red: '#FF0000',
			pink: '#FF00FF',
			yella: '#FFFF00',
			notAColor: 'hello'
		};

		Inspect($$renderer, {
			class: 'not-content mt',
			name: 'colors',
			value,
			customComponents: components
		});

		$$renderer.push(`<!----> <div class="input-row"><label>show string value <input type="checkbox"${$.attr('checked', showString, true)}/></label> <label>use default <input type="checkbox"${$.attr('checked', useDefault, true)}/></label></div>`);
	});
}