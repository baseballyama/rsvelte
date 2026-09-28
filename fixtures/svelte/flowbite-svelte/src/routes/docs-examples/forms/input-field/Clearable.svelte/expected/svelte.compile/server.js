import * as $ from 'svelte/internal/server';
import { Input } from "flowbite-svelte";

export default function Clearable($$renderer) {
	Input($$renderer, { clearable: true, value: 'Clearable input' });
}