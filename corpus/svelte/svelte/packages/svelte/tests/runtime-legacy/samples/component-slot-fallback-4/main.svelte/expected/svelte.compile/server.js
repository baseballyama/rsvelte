import * as $ from 'svelte/internal/server';
import Inner from "./Inner.svelte";

export default function Main($$renderer) {
	Inner($$renderer, {});
}