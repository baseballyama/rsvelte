import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from "./Inner.svelte";

export default function Main($$anchor) {
	Inner($$anchor, {});
}