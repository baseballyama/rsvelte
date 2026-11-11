<div>
  <div>
    <div>
      <DefinitionListItem
        term="最終ログイン"
        description={user.lastAccessedAt
          ? formatDateInOrganizationTimezone(user.lastAccessedAt)
          : "-"}
      />
    </div>
  </div>
</div>