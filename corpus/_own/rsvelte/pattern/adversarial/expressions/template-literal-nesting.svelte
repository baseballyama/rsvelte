<script>
	let user = $state({ name: 'a', tags: ['x', 'y'] });
	let greeting = $derived(
		`Hello ${user.name}, you have ${user.tags.length > 0 ? `${user.tags.map((t) => `#${t}`).join(' ')}` : `no ${'tags'}`}`,
	);
</script>

<p title={`outer ${`inner ${user.name}`} end`}>{greeting}</p>
<p>{`\`escaped backtick\` and \${escaped hole}`}</p>
