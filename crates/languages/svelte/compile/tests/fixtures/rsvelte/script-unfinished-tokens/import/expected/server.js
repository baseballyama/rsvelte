import * as $ from "svelte/internal/server";
import Component from "./component.svelte";
export default function Import($$renderer) {
	let component = void 0;
	const named = component.api();
	Component($$renderer, { n: "no" });
}
