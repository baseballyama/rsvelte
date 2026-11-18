<script lang="ts">
	class Foo {
		x?: string;
		y?;
		m?(): void {}
	}
	class B {
		x = 1;
		m() {}
	}
	class Bar extends B {
		override x = 2;
		override m(): void {}
		public override readonly z: string = 'override';
		s = 'override';
	}
	console.log(new Foo(), new Bar());
</script>
