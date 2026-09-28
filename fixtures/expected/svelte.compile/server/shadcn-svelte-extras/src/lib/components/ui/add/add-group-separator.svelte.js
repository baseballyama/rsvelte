import * as $ from 'svelte/internal/server';
import { Separator } from '$lib/components/ui/separator';

export default function Add_group_separator($$renderer, $$props) {
	let { class: className, $$slots, $$events, ...rest } = $$props;

	Separator($$renderer, $.spread_props([{ orientation: 'vertical', class: className }, rest]));
}