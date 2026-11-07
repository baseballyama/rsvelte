import * as $ from 'svelte/internal/server';
import { Timepicker } from "flowbite-svelte";

export default function Disabled($$renderer) {
	Timepicker($$renderer, { disabled: true });
}