<script>
  let v = $state(1);
</script>

<my-element attr={v} data-x={v}>slotted</my-element>
<my-element><span slot="named">n</span></my-element>
<a-b-c class="x" onclick={() => (v += 1)}>{v}</a-b-c>
<x-y aria-label="l" role="button" tabindex="0"></x-y>

<style>
  my-element,
  a-b-c,
  x-y {
    display: block;
  }
</style>
