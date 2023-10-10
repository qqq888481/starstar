import { render, createVNode } from 'vue'
import FilePreview from './filePreview.vue'

let filePreviewDom
function showPreview () {
  if (filePreviewDom) return //不再重新插入body
  const div = document.createElement('div')
  filePreviewDom = createVNode(FilePreview)
  render(filePreviewDom, div)
  document.body.appendChild(div)
}

export function openPreview (fileList) {
  showPreview()
  // console.log(filePreviewDom.component.exposed.fileData)
  filePreviewDom.component.exposed.fileData.openPreview(fileList)
}