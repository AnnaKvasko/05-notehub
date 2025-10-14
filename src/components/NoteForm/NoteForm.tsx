import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote, type CreateNoteParams } from "../../services/noteService";
import type { Note } from "../../types/note";
import css from "./NoteForm.module.css";

interface Props {
  onCancel: () => void;
  page: number;
  search: string;
  perPage: number;
}

type FormValues = CreateNoteParams;

const schema = Yup.object({
  title: Yup.string().min(3).max(50).required("Title is required"),
  content: Yup.string().max(500),
  tag: Yup.mixed<"Todo" | "Work" | "Personal" | "Meeting" | "Shopping">()
    .oneOf(["Todo", "Work", "Personal", "Meeting", "Shopping"])
    .required("Tag is required"),
});

export default function NoteForm({ onCancel, page, search, perPage }: Props) {
  const qc = useQueryClient();

  const { mutate, isPending, error } = useMutation<
    Note,
    Error,
    CreateNoteParams
  >({
    mutationFn: (body) => createNote(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes", page, search, perPage] });
    },
  });

  const initialValues: FormValues = { title: "", content: "", tag: "Todo" };

  return (
    <Formik<FormValues>
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={(values, helpers: FormikHelpers<FormValues>) => {
        mutate(values, {
          onSuccess: () => {
            helpers.resetForm();
            onCancel();
          },
          onSettled: () => helpers.setSubmitting(false),
        });
      }}
      validateOnBlur
      validateOnChange
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
              <option value="Todo">Todo</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Meeting">Meeting</option>
              <option value="Shopping">Shopping</option>
            </Field>
            <ErrorMessage name="tag" component="span" className={css.error} />
          </div>

          {error && (
            <p className={css.error}>
              {error instanceof Error ? error.message : "Failed to create note"}
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
