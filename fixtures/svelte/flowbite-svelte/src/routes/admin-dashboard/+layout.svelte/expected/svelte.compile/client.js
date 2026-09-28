import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import modeobserver from "./utils/modeobserver";
import { onMount } from "svelte";

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	$.user_effect(() => {
		console.log("data", $$props.data);
	});

	onMount(modeobserver);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children);
	$.append($$anchor, fragment);
	$.pop();
}