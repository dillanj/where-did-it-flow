import { CategoryRulesPanel } from '../category-rules/view/components/category-rules-panel'
import { CsvImportWrapper } from '../csv-import/view/wrapper'
import type { AppPresenter } from '../presenter/app-presenter'

export type AppWorkspaceProps = {
  presenter: AppPresenter
}

export const AppWorkspace = ({ presenter }: AppWorkspaceProps) => {
  return (
    <main className='import-page'>
      <CsvImportWrapper presenter={presenter.csvImportPresenter} />
      <CategoryRulesPanel presenter={presenter.categoryRulesPresenter} />
    </main>
  )
}
