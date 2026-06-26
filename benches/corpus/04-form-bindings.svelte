<script>
	let name = $state('');
	let email = $state('');
	let age = $state(18);
	let bio = $state('');
	let plan = $state('free');
	let agree = $state(false);
	let interests = $state([]);
	let contact = $state('email');

	const options = ['sports', 'music', 'reading', 'travel', 'cooking'];

	let emailValid = $derived(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email));
	let nameValid = $derived(name.trim().length >= 2);
	let canSubmit = $derived(nameValid && emailValid && agree);

	let summary = $derived(
		`${name || 'Anonymous'} <${email || 'n/a'}> — ${plan} plan, ${interests.length} interests`
	);

	function submit() {
		if (!canSubmit) return;
		console.log(summary);
	}
</script>

<form onsubmit={(e) => { e.preventDefault(); submit(); }}>
	<label>
		Name
		<input bind:value={name} class:invalid={name && !nameValid} />
	</label>

	<label>
		Email
		<input type="email" bind:value={email} class:invalid={email && !emailValid} />
	</label>

	<label>
		Age: {age}
		<input type="range" min="13" max="99" bind:value={age} />
	</label>

	<label>
		Bio
		<textarea bind:value={bio} rows="3"></textarea>
	</label>

	<label>
		Plan
		<select bind:value={plan}>
			<option value="free">Free</option>
			<option value="pro">Pro</option>
			<option value="team">Team</option>
		</select>
	</label>

	<fieldset>
		<legend>Interests</legend>
		{#each options as opt}
			<label class="check">
				<input type="checkbox" bind:group={interests} value={opt} />
				{opt}
			</label>
		{/each}
	</fieldset>

	<fieldset>
		<legend>Preferred contact</legend>
		<label><input type="radio" bind:group={contact} value="email" /> Email</label>
		<label><input type="radio" bind:group={contact} value="phone" /> Phone</label>
	</fieldset>

	<label class="check">
		<input type="checkbox" bind:checked={agree} />
		I agree to the terms
	</label>

	<p class="summary">{summary}</p>

	<button type="submit" disabled={!canSubmit}>Submit</button>
</form>

<style>
	form {
		display: grid;
		gap: 0.75rem;
		max-width: 28rem;
	}

	.invalid {
		border-color: #dc2626;
	}

	.summary {
		font-size: 0.875rem;
		color: #555;
	}
</style>
