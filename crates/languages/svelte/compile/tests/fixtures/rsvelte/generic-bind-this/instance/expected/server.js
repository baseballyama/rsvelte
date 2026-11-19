import * as $ from "svelte/internal/server";
import Component from "./component.svelte";
export default function Instance($$renderer) {
	let bound = void 0;
	bound?.open("y");
	Component($$renderer, { value: "x" });
}
