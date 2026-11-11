<script>
	const m = new Map();
	const s = new Set();
	const d = new Date();
	const readOnly = new Map();
</script>

<button onclick={() => m.set(1, 2)}>map</button>
<button onclick={() => s.add(1)}>set</button>
<button onclick={() => d.setHours(0)}>date</button>
<p>{readOnly.get(1)}</p>
