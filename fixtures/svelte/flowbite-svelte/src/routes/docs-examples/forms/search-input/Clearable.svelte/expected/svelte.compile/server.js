import * as $ from 'svelte/internal/server';
import { Search } from "flowbite-svelte";

export default function Clearable($$renderer) {
	Search($$renderer, { size: 'md', clearable: true });
}