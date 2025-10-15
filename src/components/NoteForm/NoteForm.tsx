import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote, type CreateNoteParams } from "../../services/noteService";
import type { Note } from "../../types/note";
import css from "./NoteForm.module.css";

export interface NoteFormProps {
  onCancel: () => void;
}

type FormValues = CreateNoteParams;

const TAGS = ["Todo", "Work", "Personal", "Meeting", "Shopping"] as const;

const schema = Yup.object({
  title: Yup.string()
    .min(3, "Min 3")
    .max(50, "Max 50")
    .required("Title is required"),
  content: Yup.string().max(500, "Max 500").defined(),
  tag: Yup.string()
    .oneOf([...TAGS], "Invalid tag")
    .required("Tag is required"),
});

export default function NoteForm({ onCancel }: NoteFormProps) {
  const qc = useQueryClient();

  const { mutate, isPending, error } = useMutation<
    Note,
    Error,
    CreateNoteParams
  >({
    mutationFn: (body) => createNote(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"], exact: false });
    },
  });

  const initialValues: FormValues = { title: "", content: "", tag: "Todo" };

  return (
    <Formik<FormValues>
      initialValues={initialValues}
      validationSchema={schema}
      validateOnBlur
      validateOnChange
      onSubmit={(values, helpers) => {
        mutate(values, {
          onSuccess: () => {
            helpers.resetForm();
            onCancel();
          },
          onSettled: () => helpers.setSubmitting(false),
        });
      }}
    >
      {({ isSubmitting }) => (
        <Form className={css.form}>
          <div className={css.formGroup}>
            <label htmlFor="title">Title</label>
            <Field id="title" name="title" className={css.input} />
            <ErrorMessage name="title" component="span" className={css.error} />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="content">Content</label>
            <Field
              as="textarea"
              id="content"
              name="content"
              rows={8}
              className={css.textarea}
            />
            <ErrorMessage
              name="content"
              component="span"
              className={css.error}
            />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="tag">Tag</label>
            <Field as="select" id="tag" name="tag" className={css.select}>
              {TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Field>
            <ErrorMessage name="tag" component="span" className={css.error} />
          </div>

          {error && (
            <p className={css.error}>
              {(error as Error).message ?? "Failed to create note"}
            </p>
          )}

          <div className={css.actions}>
            <button
              type="button"
              className={css.cancelButton}
              onClick={onCancel}
              disabled={isSubmitting || isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={css.submitButton}
              disabled={isSubmitting || isPending}
            >
              Create note
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
