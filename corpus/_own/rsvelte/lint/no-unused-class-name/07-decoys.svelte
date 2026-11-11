<script>
  import Comp from './01-basic.svelte';
  let tag = 'div';
  let cond = true;
  function cx(...xs) {
    return xs.join(' ');
  }
</script>

<Comp class="component-only" />
<svelte:element this={tag} class="dynamic-only">x</svelte:element>
<div class={cx('expr-only', cond && 'other')}>expression value</div>
<div class={['arr-only', cond && 'arr-two']}>array class</div>

<style>
  .never-referenced {
    color: red;
  }
</style>
