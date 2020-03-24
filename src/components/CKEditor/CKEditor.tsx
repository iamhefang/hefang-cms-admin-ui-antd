import React, { createRef, CSSProperties } from 'react';
import '@ckeditor/ckeditor5-build-classic/build/translations/zh-cn';
// import WordCount from "@ckeditor/ckeditor5-word-count/src/wordcount"
import ClassicCkEditor from '@ckeditor/ckeditor5-build-classic';
// import InlineCkEditor from "@ckeditor/ckeditor5-build-inline";
import { execute } from 'hefang-js';
import _ from 'lodash';

export interface CKEditorConfig {
  toolbar?: {
    items?: string[];
  };
  plugins?: Array<string | Function>;
  language?: string;

  [name: string]: any;
}

export interface PriorityString {}

export interface CKEditorProps {
  style?: CSSProperties;
  placeholder?: string;
  className?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (data: string) => void;
  config?: CKEditorConfig;
  onInit?: (editor: ClassicEditor) => void;
  onError?: (error: Error) => void;
  onBlur?: Function;
  onFocus?: Function;
}

export type KvMap = { [name: string]: any };

export type LoadedPlugins = Array<any>;

export interface EditorModel {
  document: {
    on(event: string, callback: Function): void;
  };
}

declare class ClassicEditor {
  public static builtinPlugins: Array<Function>;

  public static defaultConfig: CKEditorConfig;

  public model: EditorModel;

  public editing: {
    view: {
      document: {
        on(event: string, callback: Function): void;
      };
    };
  };

  public static create(
    container: HTMLDivElement | HTMLTextAreaElement,
    config?: CKEditorConfig,
  ): Promise<ClassicEditor>;

  public getData(): string;

  public setData(data: string): void;

  public set(name: string, value: any): void;

  public set(map: KvMap): void;

  public off(event: string, callback: Function): void;

  public initPlugins(): Promise<LoadedPlugins>;

  public on(event: string, callback: Function, options?: PriorityString): void;

  public destroy(): void;
}

export default class CKEditor extends React.Component<CKEditorProps> {
  private refContainer = createRef<HTMLTextAreaElement>();

  private editor?: ClassicEditor;

  componentDidMount(): void {
    (ClassicCkEditor as typeof ClassicEditor)
      .create(
        this.refContainer.current as HTMLTextAreaElement,
        _.merge(
          {
            language: 'zh-cn',
          },
          this.props.config,
        ),
      )
      .then((editor: ClassicEditor) => {
        this.editor = editor;
        execute(this.props.onInit, editor);
        editor.model.document.on('change:data', () => {
          execute(this.props.onChange, editor.getData());
        });
        editor.editing.view.document.on('blur', (e: any) => execute(this.props.onBlur, e, editor));
        editor.editing.view.document.on('focus', (e: any) =>
          execute(this.props.onFocus, e, editor),
        );
      })
      .catch(this.props.onError);
  }

  shouldComponentUpdate(nextProps: Readonly<CKEditorProps>): boolean {
    const { value: nextValue, config: nextConfig } = nextProps;
    const value = this.editor?.getData();
    const { config } = this.props;
    if (value !== nextValue) {
      this.editor?.setData(nextValue || '');
    }

    if (!_.isEqual(config, nextConfig)) {
      //
    }

    return false;
  }

  componentWillUnmount(): void {
    this.editor?.destroy();
  }

  render() {
    const { style, className, placeholder } = this.props;
    return (
      <textarea
        style={style}
        placeholder={placeholder}
        ref={this.refContainer}
        className={className}
        defaultValue={this.props.defaultValue || this.props.value || ''}
      />
    );
  }
}
