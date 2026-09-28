import * as $ from 'svelte/internal/server';
import { Spinner } from "flowbite-svelte";

export default function Default($$renderer) {
	Spinner($$renderer, {});
}