import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from "flowbite-svelte";

export default function Clearable($$anchor) {
	Input($$anchor, { clearable: true, value: 'Clearable input' });
}