<script>
  let {
    plain,
    withDefault = 1,
    dependent = withDefault * 2,
    renamed: local = "r",
    "quoted-prop": quoted = 0,
    bound = $bindable(),
    boundWithDefault = $bindable("b"),
    ...rest
  } = $props();

  const id = $props.id();
</script>

<b>{plain}</b>
<b>{withDefault}{dependent}</b>
<b>{local}{quoted}</b>
<b>{bound}{boundWithDefault}</b>
<b>{Object.keys(rest).length}</b>
<b>{id}</b>
