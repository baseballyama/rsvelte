<script lang="ts">
  let obj: any;
</script>

{#snippet annotated(p = (t: string) => t)}<span>{p}</span>{/snippet}
{#snippet sibling(q, p = (t: string) => t)}<span>{q}{p}</span>{/snippet}
{#snippet annot(p: any = 1)}<span>{p}</span>{/snippet}
{#snippet asExpr(p = obj as string)}<span>{p}</span>{/snippet}
{#snippet plain(p = () => 1)}<span>{p}</span>{/snippet}

{@render annotated()}
{@render sibling(1)}
{@render annot()}
{@render asExpr()}
{@render plain()}
