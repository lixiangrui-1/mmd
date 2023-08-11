/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare interface Window {
  onModuleLoad: () => void,
  showSaveFilePicker: (option: { suggestedName: string, type: {
    description: string
    accept: { [key: string]: string[] }
  }}) => FileSystemFileHandle
}



declare module '*.m4a'