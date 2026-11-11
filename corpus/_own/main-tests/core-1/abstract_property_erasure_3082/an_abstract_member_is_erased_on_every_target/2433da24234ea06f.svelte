<script lang="ts">
	abstract class B {
		abstract kind: string;
		protected abstract other: number;
		abstract m(): void;
		declare size: number;
		protected kept: string = 'k';
	}
	const b = new (class extends B {
		kind = 'x';
		other = 1;
		m() {}
	})();
</script>

<p>{b.kind}</p>
