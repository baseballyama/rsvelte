<script>
  let { load } = $props();
  let a = $state({ v: 0 });
  a.v = /* c */ await load();
</script>
{a.v}
