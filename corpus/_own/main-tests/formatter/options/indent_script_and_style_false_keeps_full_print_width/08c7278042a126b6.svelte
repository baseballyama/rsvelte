<script>
const metrics = $derived.by(() => {
    return {
        recurring_amount:
            overview.recurring_snapshot?.currencies?.[0]?.committed_monthly_equivalent_display ||
            'No recurring base yet',
    }
})
</script>