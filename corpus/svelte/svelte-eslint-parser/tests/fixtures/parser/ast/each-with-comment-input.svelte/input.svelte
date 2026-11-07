<script>
import Foo from './foo.svelte'
</script>
{#each Array(
//comment
) as i}<Foo>{i}</Foo>{/each}
