<script lang="ts">
  interface B { a: string }
  interface A extends B { b: string }
  export let x: A;
</script>
{x}