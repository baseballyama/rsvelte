import * as $ from "svelte/internal/server";
import { x } from "m";
export default function Export_all($$renderer) {
	let y = 1;
	$$renderer.push(`<!---->1${$.escape(x)}`);
}
