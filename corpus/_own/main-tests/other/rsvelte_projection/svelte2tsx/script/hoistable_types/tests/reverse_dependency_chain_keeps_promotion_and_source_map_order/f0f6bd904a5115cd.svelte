<script lang="ts">
type Root = { value: Middle };
type Middle = { value: Leaf };
type Leaf = string;
let { value }: Root = $props();
</script>
<p>{value}</p>