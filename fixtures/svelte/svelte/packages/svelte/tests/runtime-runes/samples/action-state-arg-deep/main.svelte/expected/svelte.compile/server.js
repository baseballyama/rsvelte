import * as $ from 'svelte/internal/server';
import Task from "./Task.svelte";

export default function Main($$renderer) {
	let task = { text: "initial" };

	Task($$renderer, { prop: task });
	$$renderer.push(`<!----> <button>Update prop</button>`);
}