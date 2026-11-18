<script>
	export function focus() {
		el?.focus();
	}

	export class Helper {
		static tag = 'h';
	}

	export const config = { deep: { nested: true } };

	let el;
	export let label = 'x';
</script>

<input bind:this={el} placeholder={label} data-tag={Helper.tag} data-deep={config.deep.nested} />
