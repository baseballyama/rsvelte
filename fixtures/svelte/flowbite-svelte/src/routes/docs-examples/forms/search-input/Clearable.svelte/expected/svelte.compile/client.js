import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Search } from "flowbite-svelte";

export default function Clearable($$anchor) {
	Search($$anchor, { size: 'md', clearable: true });
}