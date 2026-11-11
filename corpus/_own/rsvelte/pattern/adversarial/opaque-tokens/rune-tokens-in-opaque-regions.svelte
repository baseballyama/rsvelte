<script>
  // $state( $derived( $effect( $props( $bindable( $inspect(
  const asString = "$state( $derived( $props(";
  const asTemplate = `$effect( $inspect(`;
  const asRegex = /\$state\(|\$derived\(/g;

  /* $state( $derived( */
  let real = $state(1);
  const realDerived = $derived(real + 1);
</script>

<b>{asString.length}{asTemplate.length}{asRegex.source.length}</b>
<b>{real}{realDerived}</b>
<p>{"$state(1)"} $derived(2)</p>
<!-- $effect(() => {}) -->
