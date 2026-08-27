<script lang="ts">
	declare function mark(target: unknown, context: ClassDecoratorContext): void;
	declare function value(): string;

	@mark
	class Example {
		method() {
			let local = value();
			return local;
		}
	}
</script>
