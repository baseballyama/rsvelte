import 'svelte/internal/disclose-version';
import { createContext } from "svelte";
import Child from "./child.svelte";
import * as $ from 'svelte/internal/client';

const [get, set] = createContext();

export { get };

export default function Main($$anchor, $$props) {
	$.push($$props, true);
	set('hello');

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const failed = ($$anchor, error = $.noop) => {
			Child($$anchor, {
				get error() {
					return error();
				}
			});
		};

		$.boundary(node, { failed }, ($$anchor) => {
			Child($$anchor, {});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}