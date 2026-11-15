import type {
  Category,
  CategoryOption,
  CategoryRule
} from '../../domain/domain-model'

export type RuleListProps = {
  categories: Category[]
  allCategoryOptions: CategoryOption[]
  rules: CategoryRule[]
  isDeleting: boolean
  onEdit: (ruleId: string) => void
  onDelete: (ruleId: string) => void
}

const findCategoryLabel = (input: {
  categoryId: string | null
  options: CategoryOption[]
}) => {
  if (!input.categoryId) {
    return 'Unmapped'
  }

  return (
    input.options.find((category) => {
      return category.id === input.categoryId
    })?.label ?? 'Unknown'
  )
}

export const RuleList = (props: RuleListProps) => {
  if (props.rules.length === 0) {
    return <p className='empty-state'>No rules yet.</p>
  }

  return (
    <div className='rule-list'>
      {props.rules.map((rule) => {
        return (
          <article key={rule.id} className='rule-row'>
            <div>
              <strong>{rule.name}</strong>
              <span>
                {rule.matchType} "{rule.matchValue}" {'->'}{' '}
                {findCategoryLabel({
                  categoryId: rule.subcategoryId ?? rule.categoryId,
                  options: props.allCategoryOptions
                })}
              </span>
              <small>
                Priority {rule.priority} · {rule.isEnabled ? 'enabled' : 'disabled'}
                {rule.outflowClassification ? ` · ${rule.outflowClassification}` : ''}
              </small>
            </div>
            <div className='rule-actions'>
              <button
                type='button'
                onClick={() => {
                  props.onEdit(rule.id)
                }}
              >
                Edit
              </button>
              <button
                type='button'
                disabled={props.isDeleting}
                onClick={() => {
                  props.onDelete(rule.id)
                }}
              >
                Delete
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
