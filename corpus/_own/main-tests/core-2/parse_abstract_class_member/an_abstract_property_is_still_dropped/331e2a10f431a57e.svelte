<script lang="ts">
	abstract class B {
		abstract p: string;
		concrete() { return 1; }
	}
	new (class extends B { p = ''; })();
</script>