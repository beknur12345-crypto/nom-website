import { useId } from 'react';

type Common = { name: string; label: string; error?: string; onEdit?: (name: string) => void };
type InputProps = Common & { as?: 'input' } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'>;
type TextareaProps = Common & { as: 'textarea' } & Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'name'
  >;
type SelectProps = Common & { as: 'select' } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'name'>;

/** Labelled form control with an accessible error message. */
export function Field(props: InputProps | TextareaProps | SelectProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const { name, label, error, onEdit, className, ...rest } = props;
  const shared = {
    id,
    name,
    className: `input ${className ?? ''}`,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    onChange: () => onEdit?.(name),
  };

  let control: React.ReactNode;
  if (rest.as === 'textarea') {
    const { as: _as, ...attrs } = rest;
    control = <textarea {...attrs} {...shared} />;
  } else if (rest.as === 'select') {
    const { as: _as, ...attrs } = rest;
    control = <select {...attrs} {...shared} />;
  } else {
    const { as: _as, ...attrs } = rest;
    control = <input {...attrs} {...shared} />;
  }

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {control}
      {error && (
        <small className="field__error" id={errorId}>
          {error}
        </small>
      )}
    </div>
  );
}
