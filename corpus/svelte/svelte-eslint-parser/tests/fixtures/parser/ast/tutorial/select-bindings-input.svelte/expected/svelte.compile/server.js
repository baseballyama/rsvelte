import * as $ from 'svelte/internal/server';

export default function Select_bindings_input($$renderer) {
	let questions = [
		{ id: 1, text: `Where did you go to school?` },
		{ id: 2, text: `What is your mother's name?` },
		{
			id: 3,
			text: `What is another personal fact that an attacker could easily find with Google?`
		}
	];

	let selected;
	let answer = '';

	function handleSubmit() {
		alert(`answered question ${selected.id} (${selected.text}) with "${answer}"`);
	}

	$$renderer.push(`<h2>Insecurity questions</h2> <form>`);

	$$renderer.select({ value: selected }, ($$renderer) => {
		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(questions);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let question = each_array[$$index];

			$$renderer.option({ value: question }, ($$renderer) => {
				$$renderer.push(`${$.escape(question.text)}`);
			});
		}

		$$renderer.push(`<!--]-->`);
	});

	$$renderer.push(` <input${$.attr('value', answer)} class="svelte-1gf1md7"/> <button${$.attr('disabled', !answer, true)} type="submit">Submit</button></form> <p>selected question ${$.escape(selected ? selected.id : '[waiting...]')}</p>`);
}