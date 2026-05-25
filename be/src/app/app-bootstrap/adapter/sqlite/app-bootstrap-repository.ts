import type { DatabaseClient } from '../../../../db/connection'
import { appMetadataTable } from './schema'

export const createAppBootstrapRepository = (client: DatabaseClient) => {
  const upsertBootstrapTimestamp = (timestampIso: string) => {
    client.db
      .insert(appMetadataTable)
      .values({
        key: 'bootstrap.last_started_at',
        value: timestampIso,
        updatedAt: new Date().toISOString()
      })
      .onConflictDoUpdate({
        target: appMetadataTable.key,
        set: {
          value: timestampIso,
          updatedAt: new Date().toISOString()
        }
      })
      .run()
  }

  return {
    upsertBootstrapTimestamp
  }
}
