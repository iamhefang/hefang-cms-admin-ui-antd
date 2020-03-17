import CKEditor from "ckeditor4-react";
import React from "react";

export interface RichTextEditorProps {
  value?: string
  onChange?: (html: string) => void
  config?: RichTextEditorConfig
}

export interface RichTextEditorConfig {
  height?: string | number
  resize_enabled?: boolean
}

export default function RichTextEditor(props: RichTextEditorProps) {
  return <CKEditor
    data={props.value}
    config={props?.config}
    onChange={(evt: { editor: CkEditor }) => props.onChange && props.onChange(evt.editor.getData() + "")}/>
}
