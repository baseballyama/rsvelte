import * as $ from 'svelte/internal/server';
import Inspect from '$lib/Inspect.svelte';

export default function _page($$renderer) {
	let data = {
		a: `{}`,
		b: `[`,
		c: '[ "a", "b", "c", 1, 2, 3, true,false, { "a": [1,2,3] } ]'
	};

	let nestedData = {
		a: `{}`,
		b: {
			a: `{}`,
			b: `[`,
			b2: `{`,
			c: '[ "a", "b", "c", 1, 2, 3, true,false,null ]',
			d: JSON.stringify(data),
			e: {
				a: `{}`,
				b: `[`,
				b2: `{`,
				c: '[ "a", "b", "c", 1, 2, 3, true,false,null ]',
				d: JSON.stringify(data),
				e: {}
			}
		},
		b2: `{`,
		c: '[ "a", "b", "c", 1, 2, 3, true,false,null ]',
		d: JSON.stringify(data),
		e: {
			a: {
				a: `{}`,
				b: `[`,
				b2: `{`,
				c: '[ "a", "b", "c", 1, 2, 3, true,false,null ]',
				d: JSON.stringify(data),
				e: {}
			},
			b: `[`,
			b2: `{`,
			c: '[ "a", "b", "c", 1, 2, 3, true,false,null ]',
			d: JSON.stringify(data),
			e: {
				a: `{}`,
				b: `[`,
				b2: `{`,
				c: '[ "a", "b", "c", 1, 2, 3, true,false,null ]',
				d: JSON.stringify(data),
				e: {}
			}
		}
	};

	let expandAll = false;

	$$renderer.push(`<label>parse <input type="checkbox"${$.attr('checked', expandAll, true)}/></label> <!---->`);

	{
		Inspect($$renderer, { value: nestedData, parseJson: true, expandAll });
	}

	$$renderer.push(`<!---->`);
}