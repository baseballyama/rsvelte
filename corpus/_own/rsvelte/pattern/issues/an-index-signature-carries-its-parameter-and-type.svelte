<script lang="ts">
	interface Dict {
		[key: string]: number;
	}

	interface Frozen {
		readonly [key: string]: number;
	}

	type Inline = { [key: symbol]: () => void };

	interface Named {
		size: number;
		at(i: number): string;
	}

	export let dict: Dict = {} as Dict;
	export let frozen: Frozen = {} as Frozen;
	export let inline: Inline = {} as Inline;
	export let named: Named = {} as Named;
</script>

{dict.a}{frozen.a}{named.size}{typeof inline}
