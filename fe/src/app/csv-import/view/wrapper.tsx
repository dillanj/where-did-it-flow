import type { CsvImportPresenter } from '../presenter/csv-import-presenter'
import { CsvImportScreen } from './components/csv-import-screen'

export type CsvImportWrapperProps = {
  presenter: CsvImportPresenter
}

export const CsvImportWrapper = ({ presenter }: CsvImportWrapperProps) => {
  return <CsvImportScreen presenter={presenter} />
}
