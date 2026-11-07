import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from "./inner.svelte";

export default function Wrapper($$anchor, $$props) {
	const getter = $.prop($$props, 'getter', 3, () => -1);

	Inner($$anchor, {
		get getter() {
			return getter();
		}
	});
}