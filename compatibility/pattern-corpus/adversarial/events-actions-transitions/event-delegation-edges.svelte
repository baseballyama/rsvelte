<script>
	let n = $state(0);
	const handler = () => n++;
	let dyn = $state('click');
</script>

<button onclick={handler}>a</button>
<div onclickcapture={handler} role="none">c</div>
<input onchange={handler} oninput={handler} />
<p>{n}{dyn}</p>
