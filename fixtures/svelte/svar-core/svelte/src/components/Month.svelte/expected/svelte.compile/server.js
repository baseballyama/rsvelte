import * as $ from 'svelte/internal/server';
import Locale from "../Locale.svelte";
import Month from "./calendar/Month.svelte";

export default function Month_1($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	Locale($$renderer, {
		children: ($$renderer) => {
			Month($$renderer, $.spread_props([props]));
		},
		$$slots: { default: true }
	});
}