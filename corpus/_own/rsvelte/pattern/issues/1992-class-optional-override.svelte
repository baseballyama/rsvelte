<script lang="ts">
	class Foo {
		x?: string;
		m?(): void {}
	}

	class Base {
		x = 1;
	}

	class Bar extends Base {
		override x = 2;
	}

	const total = new Bar().x;
</script>

<p>{total}{new Foo().x}</p>
