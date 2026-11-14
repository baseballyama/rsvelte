import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import Component from "./component.svelte";
export default function Import($$anchor) {
	Component($$anchor, { name: "a" });
}
