import {
  categoryRuleMatchTypes,
  type CategoryOption,
  type CategoryRuleDraft
} from '../../domain/domain-model'

export type RuleFormProps = {
  draft: CategoryRuleDraft
  topLevelCategoryOptions: CategoryOption[]
  subcategoryOptions: CategoryOption[]
  editingRuleId: string | null
  isSaving: boolean
  onChange: (
    field: keyof CategoryRuleDraft,
    value: string | number | boolean | null
  ) => void
  onSave: () => void
  onCancel: () => void
}

export const RuleForm = (props: RuleFormProps) => {
  return (
    <div className='rules-form rule-form'>
      <label>
        <span>Name</span>
        <input
          value={props.draft.name}
          onChange={(event) => {
            props.onChange('name', event.target.value)
          }}
        />
      </label>

      <label>
        <span>Match</span>
        <select
          value={props.draft.matchType}
          onChange={(event) => {
            props.onChange('matchType', event.target.value)
          }}
        >
          {categoryRuleMatchTypes.map((matchType) => {
            return (
              <option key={matchType} value={matchType}>
                {matchType}
              </option>
            )
          })}
        </select>
      </label>

      <label>
        <span>Text</span>
        <input
          value={props.draft.matchValue}
          onChange={(event) => {
            props.onChange('matchValue', event.target.value)
          }}
        />
      </label>

      <label>
        <span>Category</span>
        <select
          value={props.draft.categoryId}
          onChange={(event) => {
            props.onChange('categoryId', event.target.value)
          }}
        >
          <option value=''>Choose category</option>
          {props.topLevelCategoryOptions.map((category) => {
            return (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            )
          })}
        </select>
      </label>

      <label>
        <span>Subcategory</span>
        <select
          value={props.draft.subcategoryId ?? ''}
          onChange={(event) => {
            props.onChange('subcategoryId', event.target.value || null)
          }}
        >
          <option value=''>None</option>
          {props.subcategoryOptions.map((category) => {
            return (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            )
          })}
        </select>
      </label>

      <label>
        <span>Outflow</span>
        <select
          value={props.draft.outflowClassification ?? ''}
          onChange={(event) => {
            props.onChange('outflowClassification', event.target.value || null)
          }}
        >
          <option value=''>Default</option>
          <option value='negative_outflow'>negative_outflow</option>
          <option value='positive_outflow'>positive_outflow</option>
        </select>
      </label>

      <label>
        <span>Priority</span>
        <input
          type='number'
          value={props.draft.priority}
          onChange={(event) => {
            props.onChange('priority', Number(event.target.value))
          }}
        />
      </label>

      <label className='toggle-row'>
        <input
          type='checkbox'
          checked={props.draft.isEnabled}
          onChange={(event) => {
            props.onChange('isEnabled', event.target.checked)
          }}
        />
        <span>Enabled</span>
      </label>

      <div className='actions compact'>
        <button
          className='accent'
          type='button'
          onClick={props.onSave}
          disabled={props.isSaving || props.topLevelCategoryOptions.length === 0}
        >
          {props.isSaving ? 'Saving...' : props.editingRuleId ? 'Update' : 'Create'}
        </button>
        {props.editingRuleId ? (
          <button type='button' onClick={props.onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  )
}
