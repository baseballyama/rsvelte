<script>
  let kind = 'primary';
  let name = 'x';
</script>

<button type="button" class={'btn-' + kind}>binary prefix</button>
<i class={`icon-${name}`}>template prefix</i>
<em class={`${name}-end`}>template suffix</em>

<style>
  .btn-primary {
    color: red;
  }
  .icon-x {
    color: green;
  }
  .y-end {
    color: blue;
  }
</style>
