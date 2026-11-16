<script lang="ts">
	class C {
		*m(): Generator<number>;
		*m() {
			yield 1;
		}
	}
	console.log(new C());
</script>
