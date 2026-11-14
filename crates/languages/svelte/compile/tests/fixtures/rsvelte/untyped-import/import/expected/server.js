import * as $ from "svelte/internal/server";
import Component from "./component.svelte";
export default function Import($$renderer) {
	Component($$renderer, { name: "a" });
}
