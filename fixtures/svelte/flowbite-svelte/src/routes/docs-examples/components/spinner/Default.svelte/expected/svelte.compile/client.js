import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Spinner } from "flowbite-svelte";

export default function Default($$anchor) {
	Spinner($$anchor, {});
}