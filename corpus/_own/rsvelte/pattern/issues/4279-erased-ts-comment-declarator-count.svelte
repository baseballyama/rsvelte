<script lang="ts">
	interface I {
		// c
		a?: number;
	}

	export let one: I = 1;

	interface J {
		// d
		b?: number;
	}

	export let two: J = 2,
		three: J = 3;
</script>

<p>{one}{two}{three}</p>
