<template>
  <DeleteConfirmModal
    :model-value="showDeleteConfirmModal"
    :file-name="actionTargetFile?.name || ''"
    :loading="deleting"
    @update:model-value="emit('update:showDeleteConfirmModal', $event)"
    @confirm="emit('confirm-delete')"
  />

  <RenameModal
    :model-value="showRenameModalState"
    :name-value="renameValue"
    :loading="renaming"
    @update:model-value="emit('update:showRenameModalState', $event)"
    @update:name-value="emit('update:renameValue', $event)"
    @confirm="emit('confirm-rename')"
    @cancel="emit('cancel-rename')"
  />
</template>

<script setup lang="ts">
import type { FileItem } from '~~/types'
import DeleteConfirmModal from '~/components/file/DeleteConfirmModal.vue'
import RenameModal from '~/components/file/RenameModal.vue'

interface Props {
  showDeleteConfirmModal: boolean
  showRenameModalState: boolean
  renameValue: string
  deleting: boolean
  renaming: boolean
  actionTargetFile: FileItem | null
}

defineProps<Props>()
const emit = defineEmits<{
  'update:showDeleteConfirmModal': [value: boolean]
  'update:showRenameModalState': [value: boolean]
  'update:renameValue': [value: string]
  'confirm-delete': []
  'confirm-rename': []
  'cancel-rename': []
}>()
</script>
