import * as $ from 'svelte/internal/server';
import { createContext } from "svelte";
import Child from "./child.svelte";

const [get, set] = createContext();

export { get };

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		set('hello');

		{
			function failed($$renderer, error) {
				Child($$renderer, { error });
			}

			$$renderer.boundary({ failed }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				{
					Child($$renderer, {});
				}

				$$renderer.push(`<!--]-->`);
			});
		}
	});
}