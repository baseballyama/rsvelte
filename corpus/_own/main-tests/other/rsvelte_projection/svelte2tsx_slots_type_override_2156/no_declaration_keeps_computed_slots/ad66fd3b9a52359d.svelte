<script lang="ts">
    let b = 7;
</script>

<div>
    <slot a={b} />
    <slot name="foo" {b} />
</div>
