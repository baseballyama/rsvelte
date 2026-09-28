import * as $ from 'svelte/internal/server';
import Comp from './Comp.svelte';

export default function Main($$renderer) {
	let p = "hi";

	Comp($$renderer, {
		someprop: p,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { props }) => {
				$$renderer.push(`<h1>${$.escape(props.someprop)}</h1>`);
			}
		}
	});

	$$renderer.push(`<!----> <button>Change</button>`);
}