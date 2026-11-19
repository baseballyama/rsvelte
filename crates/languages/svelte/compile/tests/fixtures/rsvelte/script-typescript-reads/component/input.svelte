<script>
	class A {
		accessor x? = 1;
	}
	/** @type {{ name: string }} */
	let { name } = $props();
	new A();
</script>

<p>{name}</p>
