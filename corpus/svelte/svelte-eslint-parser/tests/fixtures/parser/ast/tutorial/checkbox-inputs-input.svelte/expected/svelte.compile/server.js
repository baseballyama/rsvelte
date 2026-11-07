import * as $ from 'svelte/internal/server';

export default function Checkbox_inputs_input($$renderer) {
	let yes = false;

	$$renderer.push(`<label><input type="checkbox"${$.attr('checked', yes, true)}/> Yes! Send me regular email spam</label> `);

	if (yes) {
		$$renderer.push(`<!--[0--><p>Thank you. We will bombard your inbox and sell your personal details.</p>`);
	} else {
		$$renderer.push(`<!--[-1--><p>You must opt in to continue. If you're not paying, you're the product.</p>`);
	}

	$$renderer.push(`<!--]--> <button${$.attr('disabled', !yes, true)}>Subscribe</button>`);
}