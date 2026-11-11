<div class="a">
  <div class="b">
    <div class="c">
      <div class="d">
        <div class="e">
          <div class="f">
            <div class="g">
              {#each list as category}
                <button
                  use:tooltip={makeTooltip(
                    category.description,
                    category.label,
                    placement,
                  )}>x</button
                >
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
