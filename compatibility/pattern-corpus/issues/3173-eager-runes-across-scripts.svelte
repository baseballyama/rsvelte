<script module>
	function compute() {
		return 1;
	}

	const module_holder = {
		p: $effect.pending(),
		e: $state.eager(compute()),
	};
</script>

<script>
	let o = $state(1);

	const instance_holder = {
		p: $effect.pending(),
		e: $state.eager(o),
		f: $state.eager(compute()),
	};

	class Gate {
		pending = $effect.pending();
		eager = $state.eager(compute());
	}

	const gate = new Gate();
</script>

<p>{$effect.pending()}</p>
<p>{instance_holder.p}{instance_holder.e}{instance_holder.f}</p>
<p>{module_holder.p}{module_holder.e}</p>
<p>{gate.pending}{gate.eager}</p>
