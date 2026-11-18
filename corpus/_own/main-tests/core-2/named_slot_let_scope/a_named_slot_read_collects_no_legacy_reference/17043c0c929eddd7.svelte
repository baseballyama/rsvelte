<script>
  export let cls;
</script>
<S>
  <M slot="option" let:option let:index class={cls(index, option)}>x</M>
</S>
