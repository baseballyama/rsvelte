<section>
  <div>
    <button
      popovertarget={popoverTarget}
      {tabindex}
      {disabled}
      {@attach effectiveTooltip != null &&
        tooltip({ content: effectiveTooltip, placement: 'right' })}
    >
      {@render content()}
    </button>
  </div>
</section>
