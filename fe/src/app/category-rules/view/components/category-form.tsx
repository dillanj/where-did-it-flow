import type { CategoryDraft, CategoryOption } from '../../domain/domain-model'

export type CategoryFormProps = {
  draft: CategoryDraft
  topLevelCategoryOptions: CategoryOption[]
  editingCategoryId: string | null
  isSaving: boolean
  onChange: (field: keyof CategoryDraft, value: string | null) => void
  onSave: () => void
  onCancel: () => void
}

export const CategoryForm = (props: CategoryFormProps) => {
  return (
    <div className='rules-form'>
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
        <span>Parent</span>
        <select
          value={props.draft.parentCategoryId ?? ''}
          onChange={(event) => {
            props.onChange('parentCategoryId', event.target.value || null)
          }}
        >
          <option value=''>Top level</option>
          {props.topLevelCategoryOptions
            .filter((category) => {
              return category.id !== props.editingCategoryId
            })
            .map((category) => {
              return (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              )
            })}
        </select>
      </label>

      <div className='actions compact'>
        <button type='button' onClick={props.onSave} disabled={props.isSaving}>
          {props.isSaving ? 'Saving...' : props.editingCategoryId ? 'Update' : 'Create'}
        </button>
        {props.editingCategoryId ? (
          <button type='button' onClick={props.onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  )
}
