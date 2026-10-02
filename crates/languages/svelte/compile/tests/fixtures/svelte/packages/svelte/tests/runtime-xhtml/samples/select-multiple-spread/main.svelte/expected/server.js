import * as $ from 'svelte/internal/server';
import Select from './select.svelte';

export default function Main($$renderer, $$props) {
	let { attrs = { value: ['1'] } } = $$props;

	Select($$renderer, { attrs });
}