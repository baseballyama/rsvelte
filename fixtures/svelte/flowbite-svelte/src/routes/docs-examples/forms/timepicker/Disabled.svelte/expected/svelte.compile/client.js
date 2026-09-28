import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Timepicker } from "flowbite-svelte";

export default function Disabled($$anchor) {
	Timepicker($$anchor, { disabled: true });
}