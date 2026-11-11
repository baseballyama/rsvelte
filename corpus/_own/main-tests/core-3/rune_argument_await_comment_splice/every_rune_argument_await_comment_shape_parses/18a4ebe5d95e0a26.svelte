<script>
  let { load } = $props();
  let a = $state.raw(/* c */ await load());
</script>
{a}
