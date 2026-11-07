import * as $ from 'svelte/internal/server';
import Inner from "./inner.svelte";

export default function Wrapper($$renderer, $$props) {
	const { getter = () => -1 } = $$props;

	Inner($$renderer, { getter });
}