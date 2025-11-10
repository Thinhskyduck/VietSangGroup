// admin/ckeditor-widget.js

const h = React.createElement;

const CKEditorControl = (props) => {
  const editorRef = React.useRef(null);
  const editorInstance = React.useRef(null);

  React.useEffect(() => {
    if (editorRef.current) {
      ClassicEditor
        .create(editorRef.current, {
          toolbar: [
            'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|',
            'outdent', 'indent', '|', 'blockQuote', 'insertTable', 'mediaEmbed', 'undo', 'redo'
          ]
        })
        .then(editor => {
          editorInstance.current = editor;
          editor.setData(props.value || '');
          editor.model.document.on('change:data', () => {
            const data = editor.getData();
            props.onChange(data);
          });
        })
        .catch(error => {
          console.error('Lỗi khi khởi tạo CKEditor:', error);
        });
    }

    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroy().catch(error => {
          console.error('Lỗi khi hủy CKEditor:', error);
        });
        editorInstance.current = null;
      }
    };
  }, []);

  return h('div', { ref: editorRef });
};

// Đăng ký widget với Decap CMS
CMS.registerWidget('ckeditor', CKEditorControl);