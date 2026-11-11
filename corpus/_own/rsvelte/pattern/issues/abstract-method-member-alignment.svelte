<script lang="ts">
	abstract class Base {
		abstract describe(a: unknown): string;
		declare size: number;
		protected readonly label: string = 'l';

		concrete() {
			return this.label;
		}
	}

	const impl = new (class extends Base {
		describe(a: unknown) {
			return String(a);
		}
	})();
</script>

<p>{impl.describe(1)}{impl.concrete()}</p>
