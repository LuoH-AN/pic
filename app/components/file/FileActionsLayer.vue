<template>
  <ImageContextMenu
    ref="imageMenuRef"
    :model-value="showImageContextMenu"
    :position="imageContextMenuPosition"
    @update:model-value="emit('update:showImageContextMenu', $event)"
    @copy="emit('copy')"
    @rename="emit('rename')"
    @delete="emit('delete')"
  />

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
import ImageContextMenu from '~/components/file/ImageContextMenu.vue'
import DeleteConfirmModal from '~/components/file/DeleteConfirmModal.vue'
import RenameModal from '~/components/file/RenameModal.vue'

interface Props {
  showImageContextMenu: boolean
  imageContextMenuPosition: { x: number; y: number }
  showDeleteConfirmModal: boolean
  showRenameModalState: boolean
  renameValue: string
  deleting: boolean
  renaming: boolean
  actionTargetFile: FileItem | null
}

defineProps<Props>()
const emit = defineEmits<{
  'update:showImageContextMenu': [value: boolean]
  'update:showDeleteConfirmModal': [value: boolean]
  'update:showRenameModalState': [value: boolean]
  'update:renameValue': [value: string]
  copy: []
  rename: []
  delete: []
  'confirm-delete': []
  'confirm-rename': []
  'cancel-rename': []
}>()

const imageMenuRef = ref<{ getMenuEl: () => HTMLElement | null } | null>(null)

defineExpose({
  getMenuEl: () => imageMenuRef.value?.getMenuEl() || null,
})
</script>
