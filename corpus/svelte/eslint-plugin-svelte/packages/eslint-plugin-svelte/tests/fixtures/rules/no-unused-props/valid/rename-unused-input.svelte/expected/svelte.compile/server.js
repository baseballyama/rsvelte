import * as $ from 'svelte/internal/server';

export default function Rename_unused_input($$renderer, $$props) {
	// userRole is unused but it should be reported by @typescript-eslint/no-unused-vars rule.
	let { name: userName, age: userAge, role: userRole } = $$props;

	console.log(userName, userAge);
}