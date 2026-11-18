<script lang="ts">
	abstract class B {
		abstract describe<T>(a: T): string;
		declare size: number;
		concrete() { return 1; }
	}
	new (class extends B { describe(a){return ''} })();
</script>
<p>x</p>