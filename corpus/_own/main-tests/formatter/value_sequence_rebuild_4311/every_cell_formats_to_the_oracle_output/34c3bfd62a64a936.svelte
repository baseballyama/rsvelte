<div>
  <div>
    <div>
      <div>
        <div>
          <div>
            <TableRow data-row={row.id} data-parent-row={expandable ? true : undefined} class="{isSelected ? 'bx--data-table--selected' : ''} {isExpanded ? 'bx--expandable-row' : ''} {expandable ? 'bx--parent-row' : ''} {expandable && parentRowId === row.id ? 'bx--expandable-row--hover' : ''} {isHighlighted ? 'bx--data-table--highlighted-row' : ''} {expandable && isSelectionEnabled ? 'bx--expandable-row--with-selection' : ''} {rowClassValue ?? ''}" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
