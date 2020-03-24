import CKEditor from '@ckeditor/ckeditor5-react';
import '@ckeditor/ckeditor5-build-classic/build/translations/zh-cn';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount';
import React from 'react';
import { execute } from 'hefang-js';
import { Alert } from 'antd';

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  config?: RichTextEditorConfig;
}

export interface RichTextEditorConfig {
  height?: string | number;
  resize_enabled?: boolean;
  language?: string;

  [key: string]: any;
}

export default function RichTextEditor(props: RichTextEditorProps) {
  return (
    <div>
      <CKEditor
        editor={ClassicEditor}
        data={props.value}
        onChange={(_: any, editor: CkEditor) => execute(props.onChange, editor.getData())}
      />
      <Alert message="wordCountPlugin?.wordCountContainer" type="info" style={{ marginTop: 15 }} />
    </div>
  );
}
