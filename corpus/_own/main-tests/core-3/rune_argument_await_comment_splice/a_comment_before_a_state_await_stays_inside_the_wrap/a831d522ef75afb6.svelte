<script>
  let { load } = $props();
  let a = $state(/* c */ await load());
</script>
{a}
